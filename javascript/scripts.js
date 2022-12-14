$(function() {
	$("#main_code").each(function () {
		this.setAttribute("placeholder", `// Example\nelse if (global.xtrachar == %num)\n{\n	doThings_char%num()\n}`);
		this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
	}).on("input", function () {
		this.style.height = 0;
		this.style.height = (this.scrollHeight) + "px";
	});

	$("#generated_code").each(function () {
		this.setAttribute("placeholder", ` Press Generate Button`);
	});
});

$(function() {
	$("#copy").click(function(){
		document.getElementById("notify2").textContent = `  Copy!`;
		$("#generated_code").select();
		document.execCommand("copy");
	});

	$("#clear").click( function(e) {
		document.getElementById("notify2").textContent = `  Crear!`;
		$("#generated_code").each(function () {
			this.innerHTML = "";
			this.style.height = 0;
			this.style.height = (this.scrollHeight) + "px";
		});
		document.getElementById("copy").style.display = "none";
		document.getElementById("clear").style.display = "none";
	});
	
	$("#generate").click( function(e) {
		var min = parseFloat(document.getElementById("min").value);
		var max = parseFloat(document.getElementById("max").value);
		var build = document.getElementById("main_code").value;
		document.getElementById("notify").textContent = `  Generated!`;
		$("#generated_code").each(function () {
			this.innerHTML = "";
			
			for (var i = min; i <= max; ++i) {
				if (i > min && i <= max && this.innerHTML != "") {
					this.innerHTML += `\n`
				};

				this.innerHTML += build.replace(/%num/gi, i).replace(/%hex/gi, decimalToPaddedHexString(i, 8));
			};
			
			this.style.height = 0;
			this.style.height = (this.scrollHeight) + "px";
		});
		document.getElementById("copy").style.display = "unset";
		document.getElementById("clear").style.display = "unset";
	});
});

$(function() { 
	var enabled = true;
	$("textarea").keydown(function(e) {

		// Escape key toggles tab on/off
		if (e.keyCode==27)
		{
			enabled = !enabled;
			return false;
		}

		// Enter Key?
		if (e.keyCode === 13 && enabled)
		{
			// selection?
			if (this.selectionStart == this.selectionEnd)
			{
				// find start of the current line
				var sel = this.selectionStart;
				var text = $(this).val();
				while (sel > 0 && text[sel-1] != '\n')
				sel--;

				var lineStart = sel;
				while (text[sel] == ' ' || text[sel]=='\t')
				sel++;

				if (sel > lineStart)
				{
					// Insert carriage return and indented text
					document.execCommand('insertText', false, "\n" + text.substr(lineStart, sel-lineStart));

					// Scroll caret visible
					this.blur();
					this.focus();
					return false;
				}
			}
		}

		// Tab key?
		if(e.keyCode === 9 && enabled) 
		{
			// selection?
			if (this.selectionStart == this.selectionEnd)
			{
				// These single character operations are undoable
				if (!e.shiftKey)
				{
					document.execCommand('insertText', false, "\t");
				}
				else
				{
					var text = this.value;
					if (this.selectionStart > 0 && text[this.selectionStart-1]=='\t')
					{
						document.execCommand('delete');
					}
				}
			}
			else
			{
				// Block indent/unindent trashes undo stack.
				// Select whole lines
				var selStart = this.selectionStart;
				var selEnd = this.selectionEnd;
				var text = $(this).val();
				while (selStart > 0 && text[selStart-1] != '\n')
					selStart--;
				while (selEnd > 0 && text[selEnd-1]!='\n' && selEnd < text.length)
					selEnd++;

				// Get selected text
				var lines = text.substr(selStart, selEnd - selStart).split('\n');

				// Insert tabs
				for (var i=0; i<lines.length; i++)
				{
					// Don't indent last line if cursor at start of line
					if (i==lines.length-1 && lines[i].length==0)
						continue;

					// Tab or Shift+Tab?
					if (e.shiftKey)
					{
						if (lines[i].startsWith('\t'))
							lines[i] = lines[i].substr(1);
						else if (lines[i].startsWith("    "))
							lines[i] = lines[i].substr(4);
					}
					else
						lines[i] = "\t" + lines[i];
				}
				lines = lines.join('\n');

				// Update the text area
				this.value = text.substr(0, selStart) + lines + text.substr(selEnd);
				this.selectionStart = selStart;
				this.selectionEnd = selStart + lines.length; 
			}

			return false;
		}

		enabled = true;
		return true;
	});
});

function decimalToPaddedHexString(number, bitsize)
{ 
	let byteCount = Math.ceil(bitsize/8);
	let maxBinValue = Math.pow(2, bitsize)-1;

	if (bitsize > 32)
		throw "number above maximum value";

	if (number < 0)
		number = maxBinValue + number + 1;

	return "0x"+(number >>> 0).toString(16).toLowerCase().padStart(byteCount*2, '0');
};