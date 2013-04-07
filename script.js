var model = {
		letters: ['a', 'b'],
		isRed: true,
		title: 'Hello World',
		message: '<em>I am filled in by domglue</em>',
		isMessageVisible: true,
		isTextInputEnabled: true,
		submitForm: function(ev) {
			ev.preventDefault()
		},
		onClick: function() {
			console.log('clicked', arguments);
		}
	};

// using ids
var dg = domglue('#content', model); 

setTimeout(function() {
    dg.title('Bounjour le monde');
    dg.message('<em>New message is now in place</em>');
}, 3000);


// using class
var dg2 = domglue('div.loop', {foo:'foo'});

setTimeout(function() {
    dg2.foo('New FOO!!1!');
}, 5000);

// passing node directly (nodeList also supported)
var div = document.createElement('div');
div.setAttribute('data-glue', 'text:foo');
var dG = domglue(div, {foo:'foo'});
console.log(div);