domglueV2
=========

Bit like domglue but does a LOT more, probably should have called it something more creative as so different but oh well =)

It's build in the same spirit, the model is just an object and none of its value need to be declared using special methods.
Instead of using one attribute to bind everything (events, etttributes, classes, text, focus....) it uses multiple attributes 
which allows for a clearer formatting, and makes it easier to read.

* 'data-glue' attribute for focuse, text, html and visible hooks
* 'data-glue-attributes' for.... attributes
* 'data-glue-style' for CSS classes
* 'data-glue-events' for event binding (any event. the event object is passed)

Domglue doesn't support any logic as hook value inside the attributes, only object property reference.

Code need some love as changed API half way.... no tests.... =p

# Usage

Quick copy/paste from index.html to show how it works.

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

    <h1 
		data-glue="text:title"
		data-glue-style="red:isRed"
		data-glue-attributes="title:title, rel:title"
		data-glue-events="click:onClick">
	</h1>

    <p data-glue="html:message, visible:isMessageVisible"></p>

	<form 
		data-glue-events="submit:submitForm" 
		method="post"
	> 
		<input 
			type="checkbox" 
			data-glue-attributes="checked:isMessageVisible" 
			data-glue-events="click:toggleMesssageVisible"
		/>
		<input 
			type="text" 
			data-glue="focused:isTextInputEnabled"  
		/>
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
	},
	toggleMesssageVisible: function() {
		this.isMessageVisible(!this.isMessageVisible());
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