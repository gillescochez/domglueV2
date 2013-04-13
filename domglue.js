(function() {

	'use strict';

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
		
		domglue.detectAndSetup(instance, target);
		domglue.detectAndSetup(instance, target, 'attributes');
		domglue.detectAndSetup(instance, target, 'events');
		domglue.detectAndSetup(instance, target, 'style');
	};
	
	domglue.detectAndSetup = function(instance, target, extra) {
	
		var elements, len, i,
			attr = domglue.getAttrStr(extra);

		if (target.hasAttribute(attr)) domglue.setup(instance, target);
		elements = target.querySelectorAll('[' + attr + ']');
		len = elements.length;
		i = 0;
		
		for (; i < len; i++) domglue.setup(instance, elements[i], extra);
	};
	
	domglue.getAttrStr = function(extra) {
		return domglue.settings.attr + (extra ? '-' + extra : '' );
	};
	
	domglue.setup = function(instance, el, extra) {
				
		var attr = domglue.getAttrStr(extra),
			config = domglue.extract(
			el.getAttribute(attr)
		);

		if (config) {
			
			// store element attached with config
			config.__target = el;
			
			if (domglue.settings.production) {
				config.__target.removeAttribute(attr);
			};
			
			// store config object
			instance[0].push(config);
			
			// generate methods / binding
			domglue.generate(instance, config, extra);
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
				
				domglue.hooks[object.hook].apply(instance, args);
			});
		};
	};

	domglue.generate = function(instance, config, extra) {
		
		var key, value, isEvent, isClass, isAttr;
		
		for (key in config) {
		
			value = config[key];
			
			//we don't handle anything else than data key (for now)
			if (!instance[1][value]) continue;
			
			isEvent = extra === 'events';
			isClass = extra === 'style';
			isAttr = extra === 'attributes';
			
			if (domglue.hooks[key]) {
			
				instance[2][value].push({
					hook: key
				});
			
			} else if (isEvent) {
			
				domglue.hooks.onEvent(
					key, instance, value
				);
				
			} else if (isAttr) {
			
				instance[2][value].push({
					hook: 'attr',
					key: key
				});
				
			} else if (isClass) {
			
				instance[2][value].push({
					hook: 'class',
					key: key
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
	
		if (!str) return;
	
		var obj = {};
	
		str.split(',').forEach(function(pair) {
		
			var cols = pair.trim().split(':'),
				key = cols[0].trim(), 
				value = (cols[1] || '').trim();
				
			if (value) obj[key] = value;
		});
		
		return obj;
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
			
				if (cfg[attribute] === key) {
				
					if (value) {
						cfg.__target.setAttribute(attribute, value);
					} else {
						cfg.__target.removeAttribute(attribute);
					};
				};
			});
		},
	
		class: function(attribute, instance, key, value) {
		
			var cname = attribute.substring(0,1).toLowerCase() 
						+ attribute.substring(1, attribute.length);
		
			instance[0].forEach(function(cfg) {
			
				if (cfg[attribute] === key) {
				
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
			
				if (cfg[type] === value) {
				
					if (cfg.__target.addEventListener) {
					
						cfg.__target.addEventListener(type, callback, false);
						
					} else if (cfg.__target.attachEvent) {
					
						cfg.__target.attachEvent('on' + type, callback);
					};
				};
			});
		}
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