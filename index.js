// format console
(function() {
	var interpeterLog = {};
	for(var key in console) {
		interpeterLog[key] = console[key];

		console[key] = (function() {
			var keyClusore = key;
			return function(str) {
				interpeterLog[keyClusore](str);
				InterpeterMobile.consoleLog.push(str);
			}
		})();
	}
})();

// bind textarea event
window.InterpeterTextarea = function(textarea) {
	var self = this;

	this.textarea = textarea;
	this.lineCount = 0;

	document.addEventListener('input', this.resize.bind(this));
};

window.InterpeterTextarea.prototype.resize = function() {
	this.lineCount = this.textarea.value.split('\n').length;
	if(this.textarea.offsetHeight < this.textarea.scrollHeight) {
		this.textarea.style.height = this.textarea.scrollHeight  + 'px';
	}
};

window.InterpeterTextarea.prototype.getCurrentLineNum = function() {
	return this.textarea.value.substr(0, this.textarea.selectionStart).split('\n').length;
};

window.InterpeterTextarea.prototype.isFirstLine = function() {
	return this.getCurrentLineNum() <= 1;
};

window.InterpeterTextarea.prototype.isLastLine = function() {
	return this.getCurrentLineNum() >= this.lineCount;
};

window.InterpeterTextarea.prototype.getLineCount = function() {
	return this.lineCount;
};

window.InterpeterTextarea.prototype.getValue = function() {
	return this.textarea.value;
};

window.InterpeterTextarea.prototype.setValue = function(value) {
	this.clearValue();
	this.textarea.value = value;
	this.resize();
};

window.InterpeterTextarea.prototype.clearValue = function() {
	this.textarea.value = '';
	this.textarea.style.height = 'auto';
};

// storage
window.InterpeterHistory = function() {
	try {
		this.history = JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || [];
	} catch(exception) {
		this.history = [];
	}
};

window.InterpeterHistory.prototype.HISTORY_KEY = 'interpeter-history';
window.InterpeterHistory.prototype.MAX_LENGTH = 99;

window.InterpeterHistory.prototype.add = function(item) {
	if(this.history.length > this.MAX_LENGTH) {
		this.history.shift();
	}

	this.remove(item);
	this.history.push(item);
	this.setHistory();
};

window.InterpeterHistory.prototype.remove = function(item) {
	this.history = this.history.filter(function(hs) {
		return hs !== item;
	});
	this.setHistory();
};

window.InterpeterHistory.prototype.clear = function(item) {
	this.history = [];
	this.setHistory();
};

window.InterpeterHistory.prototype.getHistory = function() {
	return this.history;
};

window.InterpeterHistory.prototype.setHistory = function() {
	return localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
};

// main
window.InterpeterMobile = window.InterpeterMobile || {
	textarea: undefined,
	historyIndex: 0,
	historyStorage: new window.InterpeterHistory,
	historyStatementWraper: undefined,
	historyPreCode: undefined,
	consoleLog: [],
	init: function() {
		this.textarea = new window.InterpeterTextarea(document.getElementById('input-statement'));

		this.historyStatementWraper = document.getElementById('history-statement');
		this.historyPreCode = document.getElementById('history-precode');

		this.historyIndex = this.historyStorage.getHistory().length - 1;

		this.bindEvent();
	},
	end: function() {
		if(this.historyIndex < this.historyStorage.getHistory().length - 1) {
			this.historyStorage.remove(this.textarea.getValue());
		}

		this.historyStorage.add(this.textarea.getValue());
		this.historyIndex = this.historyStorage.getHistory().length - 1;

		this.textarea.clearValue();

		window.scrollTo(0, document.body.scrollHeight);
	},
	getPreHistoryValue: function(event) {
		if(!this.textarea.isFirstLine() && !event) {
			return;
		}

		if(this.historyIndex < 0) {
			this.textarea.setValue('');
			return;
		}

		if(this.historyIndex > this.historyStorage.getHistory().length - 1) {
			this.historyIndex = this.historyStorage.getHistory().length - 1;
		}

		this.textarea.setValue(this.historyStorage.getHistory()[this.historyIndex--]);
	},
	getNextHistoryValue: function(event) {
		if(!this.textarea.isLastLine() && !event) {
			return;
		}

		if(this.historyIndex >= this.historyStorage.getHistory().length) {
			this.textarea.setValue('');
			return;
		}

		if(this.historyIndex < 0) {
			this.historyIndex = 0;
		}

		this.textarea.setValue(this.historyStorage.getHistory()[this.historyIndex++]);
	},
	inputChange: function(event) {
		if(event.key === 'Enter' || event.keyCode === 13) {
			event.preventDefault();
			this.onEnterKey();
		} else if(event.key === 'ArrowUp' || event.keyCode === 38) {
			this.getPreHistoryValue();
			this.consoleLog = [];
		} else if(event.key === 'ArrowDown' || event.keyCode === 40) {
			this.getNextHistoryValue();
			this.consoleLog = [];
		} else {
			this.consoleLog = [];
		}
	},
	onEnterKey: function() {
		var self = this;

		if(!this.textarea.getValue()) {
				return;
			}

		setTimeout(function() {
			self.appendToHistory(self.executeStatement()).end();
		}, 0);
	},
	bindEvent: function() {
		document.addEventListener('keydown', this.inputChange.bind(this));
		document.getElementById('arrow-up').addEventListener('click', this.getPreHistoryValue.bind(this));
		document.getElementById('arrow-down').addEventListener('click', this.getNextHistoryValue.bind(this));
		document.getElementById('enter-key').addEventListener('click', this.onEnterKey.bind(this));
		document.getElementById('delete-key').addEventListener('click', this.clearHistoryElement.bind(this));
	},
	formatResult: function(result) {
		switch(Object.prototype.toString.apply(result)) {
			case '[object Number]':
				return '<span class="num">' + result + '</span>';
			case '[object Null]':
				return '<span class="not-important">null</span>';
			case '[object Undefined]':
				return '<span class="not-important">undefined</span>';
			case '[object String]':
				return '"<span class="str">' + result + '</span>"';
			case '[object RegExp]':
				return '<span class="str">' + result + '</span>';
			case '[object Array]':
				return '[ ' + result.map((function(r) { return this.formatResult(r); }).bind(this)).join(', ') + ' ]';
			case '[object Object]':
				var str = [], randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
				for(var key in result) {
					str.push(this.formatResult(key) + ': ' + this.formatResult(result[key]));
				}
				return '<span style="color: ' + randomColor + '">{ </span>' + str.join(', ') + '<span style="color: ' + randomColor + '"> }</span>';
			case '[object Function]':
			default:
				return result.toString().replace('function', '<span class="func">function</span>');
		}
	},
	appendLogInfo: function(result) {
		this.consoleLog.push(result);
		return this.consoleLog.join('<br/>');
	},
	evalResult: function(inputValue) {
		return eval.call(window, inputValue);
	},
	executeStatement: function() {
		var textareaValue = this.textarea.getValue();
		var result;

		try {
			if(/^\{.*\}$/.test(textareaValue)) {
				this.evalResult('var _1_a_2_d_3_i_4_x_5_m_6_y_7_w_8_ = ' + textareaValue);
				result = this.formatResult(window._1_a_2_d_3_i_4_x_5_m_6_y_7_w_8_);
			} else {
				result = this.formatResult(this.evalResult(textareaValue));
			}
		} catch(exception) {
			result = '<span class="error">' + exception.message + '</span>';
		}

		return {
			statement: textareaValue,
			executeResult: this.appendLogInfo(result)
		};
	},
	createHostoryElement: function(type) {
		var pre = document.createElement('pre');
		pre.className = 'history history-' + type;

		var code = document.createElement('code');
		pre.appendChild(code);

		return pre;
	},
	clearHistoryElement: function(event) {
		this.historyStatementWraper.innerHTML = '';
	},
	appendToHistory: function(result) {
		var historyWarper = document.createElement('li');

		var nodeStatement = this.createHostoryElement('statement');
		nodeStatement.children[0].innerText = result.statement;
		historyWarper.appendChild(nodeStatement);

		var nodeExecuteResult = this.createHostoryElement('execute-result');
		nodeExecuteResult.children[0].innerHTML = result.executeResult;
		historyWarper.appendChild(nodeExecuteResult);
		this.historyStatementWraper.appendChild(historyWarper);

		return this;
	},
};  

window.onload = function() {
	InterpeterMobile.init();
};