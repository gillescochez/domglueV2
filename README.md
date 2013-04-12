domglueV2
=========

Model to View glue. Bit like domglue but does a LOT more... Still in progress... API will change soon...

# Usage

Quick copy/paste from index.html to show what is currently supported.

```html

<!DOCTYPE html>
<html>
<script src="domglue.js"></script>
<style>
.red {
	color:red;
}
</style>
<body>

<div id="content">

    <h1 data-glue="text:title, onclick:onClick, attrTitle:title, attrRel:title, classRed:isRed">Title</h1>
    <p data-glue="html:message, visible:isMessageVisible">Message</p>

	<form data-glue="onsubmit:submitForm" method="post"> 
		<input type="checkbox" data-glue="attrChecked:isMessageVisible" />
		<input type="text" data-glue="focused:isTextInputEnabled"  />
		<input type="submit" />
	</form>
</div>

<div class="loop">
    <p data-glue="text:foo"></p>
</div>

<div class="loop">
    <p data-glue="text:foo"></p>
</div>

<script src="script.js"></script>

</body>
</html>

```

```javascript

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

```