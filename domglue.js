(function() {

	var domglue = function(selector, data) {
		
		// return a new component instance
		return new domglue.component(selector, data);
	};
	
	// settings object
	domglue.settings = {
		attr: 'data-glue',
		production: true
	};

	// component return by domglue function
	domglue.component = function(selector, data) {
		
		// if selector is an object we assume HTML Element or Array of elements
		var target = selector.nodeType  === 1 ? selector : document.querySelectorAll(selector),
			key;

		// store glue settings
		this[0] = [];

		// store the raw data object
		this[1] = data;
		
		// store a map of actions to take when data is updated
		this[2] = {};
		
		// prepopulate the map with empty arrays
		for (key in data) {
		
			// good old closure...
			(function(instance, key) {
		
				// function to update / retrieve the raw data
				instance[key] = function(val) {
					if (val == undefined) return instance[1][key];
					instance[1][key] = val;
					domglue.execute(instance, key, val);
				};
				
				// add Array extras helper to add/remove items to array
				if (instance[1][key].constructor == Array) {
					
					instance[key].add = function(item) {
						instance[1][key].push(item);
						domglue.execute(instance, key, instance[1][key]);
					};
					
					instance[key].remove = function(i) {
						instance[1][key].splice(i - 1 || 0, 1);
					};
				};
			
				// create action array for the data key
				instance[2][key] = [];
			
			})(this, key);
		};
		
		// bind DOM to data 
		domglue.superglue(this, target);
	};
		
	domglue.superglue = function(instance, target) {
		
		var elements, len, i;
		
		// if target is an array we call bind on each element
		if (target.length) {
		
			for (i = 0, len = target.length; i < len; i++) {
				domglue.superglue(instance, target[i]);
			};
			
			return;
		};
		
		if (target.hasAttribute(domglue.settings.attr)) domglue.setup(instance, target);
		
		elements = target.querySelectorAll('[' + domglue.settings.attr + ']');
		len = elements.length;
		
		i = 0;
		
		for (; i < len; i++) domglue.setup(instance, elements[i]);
	};
	
	domglue.setup = function(instance, el) {
				
		var config = domglue.extract(
			el.getAttribute(domglue.settings.attr)
		);

		if (config) {
			
			// store element attached with config
			config.__target = el;
			
			if (domglue.settings.production) {
				config.__target.removeAttribute(domglue.settings.attr);
			};
			
			// store config object
			instance[0].push(config);
			
			// generate methods / binding
			domglue.generate(instance, config);
		};
	};
	
	// execute actions attached to a data update
	domglue.execute = function(instance, key, value) {
		
		var args, k;
		
		for (k in instance[2]) {
		
			instance[2][k].forEach(function(object) {
			
				args = [];
				if (object.key) args.push(object.key);
				args.push(instance);
				args.push(key);
				args.push(value);
				
				domglue.hooks[object.hook].apply(null, args);
			});
		};
	};
	
	// hooks
	domglue.hooks = {
	
		// text:
		text: function(instance, key, value) {
			
			instance[0].forEach(function(cfg) {
			
				if (cfg.text === key) cfg.__target.innerText = value;
			});
		},
	
		// html:
		html: function(instance, key, value) {
			
			instance[0].forEach(function(cfg) {
			
				if (cfg.html === key) cfg.__target.innerHTML = value;
			});
		},
	
		attr: function(attribute, instance, key, value) {
		
			instance[0].forEach(function(cfg) {
			
				if (cfg['attr' + attribute] === key) {
				
					if (value) {
						cfg.__target.setAttribute(
							[
								attribute.substring(0,1).toLowerCase() 
								+ attribute.substring(1, attribute.length)
							], 
							value
						);
					} else {
						cfg.__target.removeAttribute(
							[
								attribute.substring(0,1).toLowerCase() 
								+ attribute.substring(1, attribute.length)
							]
						);
					};
				};
			});
		},
	
		class: function(attribute, instance, key, value) {
		
			var cname = attribute.substring(0,1).toLowerCase() 
						+ attribute.substring(1, attribute.length);
		
			instance[0].forEach(function(cfg) {
			
				if (cfg['class' + attribute] === key) {
				
					if (!value) cfg.__target.className = cfg.__target.className.replace(cname, '');
					else cfg.__target.className += ' ' + cname + ' ';
				};
			});
		},
	
		visible: function(instance, key, value) {
		
			instance[0].forEach(function(cfg) {
			
				if (cfg.visible === key) {
				
					if (!value) cfg.__target.style.display = 'none';
					else cfg.__target.style.display = '';
				};
			});
		},
	
		focused: function(instance, key, value) {
		
			instance[0].forEach(function(cfg) {
			
				if (cfg.focused === key) {
				
					if (value !== false) cfg.__target.focus();
					else cfg.__target.blur();
				};
			});
		},
		
		// handle on[eventType] attributes
		onEvent: function(type, instance, value) {
			
			function callback() {
				instance[1][value].apply(instance, arguments);
			};
		
			instance[0].forEach(function(cfg) {
			
				if (cfg['on' + type] === value) {
				
					if (cfg.__target.addEventListener) {
					
						cfg.__target.addEventListener(type, callback, false);
						
					} else if (cfg.__target.attachEvent) {
					
						cfg.__target.attachEvent('on' + type, callback);
					};
				};
			});
		}
	};

	domglue.generate = function(instance, config) {
		
		var key, value, isEvent, isClass, isAttr;
		
		for (key in config) {
		
			value = config[key];
			
			//we don't handle anything else than data key (for now)
			if (!instance[1][value]) continue;
			
			isEvent = key.substring(0, 2) === 'on';
			isClass = key.substring(0, 5) === 'class';
			isAttr = key.substring(0, 4) === 'attr';
			
			if (domglue.hooks[key]) {
			
				instance[2][value].push({
					hook: key
				});
			
			} else if (isEvent) {
			
				domglue.hooks.onEvent(
					key.substr(2, key.length), instance, value
				);
				
			} else if (isAttr) {
			
				instance[2][value].push({
					hook: 'attr',
					key: key.substring(4, key.length)
				});
				
			} else if (isClass) {
			
				instance[2][value].push({
					hook: 'class',
					key: key.substring(5, key.length)
				});
				
			} else {
			
				if (key !== '__target') {
					throw "Unsupported domglue attribute detected: " + key;
				};
			};
			
			if (!isEvent) domglue.execute(instance, value, instance[1][value]);
			
			// all is to false
			isEvent = false;
			isAttr = false;
			isClass = false;
		};
	};
	
	// parse glue attribute
	// TODO improve using regex
	domglue.extract = function(str) {
	
		var obj = {};
	
		str.split(',').forEach(function(pair) {
		
			var cols = pair.trim().split(':'),
				key = cols[0].trim(), 
				value = (cols[1] || '').trim();
				
			if (value) obj[key] = value;
		});
		
		return obj;
	};
	
	// add forEach support if needed
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function(callback) {
			var len = this.length, i = 0;
			callback.apply(null, [this[i], i, this]);
		};
	};
	
	// add trim support if needed
	if (!String.prototype.trim) {
		Array.prototype.trim = function(callback) {
			return this.replace(/^\s+|\s+$/g, '');
		};
	};
	
	// expose domglue
	window.domglue = domglue;
	
	// support amd
	if (typeof define === 'function' && define.amd) {
		define('domglue', [], function() {
			return domglue;
		});
	};

})();