// format console
(function() {
	var interpeterLog = {};
	for(var key in console) {
		if(typeof console[key] === 'function') {
			interpeterLog[key] = console[key];

			console[key] = (function() {
				var keyClusore = key;
				return function(str) {
					interpeterLog[keyClusore].call(window.console, str);
					setTimeout(function() {
						window.InterpeterMobile.appendToHistoryInput(str);
					}, 0);
				}
			})();
		}
	}
})();

// textarea
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
window.InterpeterStorage = {
	getItem: function(key) {
		try {
			return JSON.parse(localStorage.getItem(key));
		} catch(exception) {
			return null;
		}
	},
	setItem: function(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}
};

// history storage
window.InterpeterHistory = function() {
	try {
		this.history = this.getItem(this.HISTORY_KEY) || [];
	} catch(exception) {
		this.history = [];
	}
};

window.InterpeterHistory.prototype = Object.create(window.InterpeterStorage);
window.InterpeterHistory.prototype.constructor = window.InterpeterHistory;

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
	return this.setItem(this.HISTORY_KEY, this.history);
};

// other libs
window.InterpeterLibsStorage = function() {
	try {
		this.libs = this.getItem(this.LIBS_KEY) || [];
	} catch(exception) {
		this.libs = [];
	}

	if(this.libs.length <= 0) {
		this.libs = [{
			name: 'jQuery 2.2.1',
			url: 'http://7xlphe.com1.z0.glb.clouddn.com/jquery.min.js',
			isLoad: false,
		}, {
			name: 'Babel for ES6',
			url: 'http://7xlphe.com1.z0.glb.clouddn.com/babel.min.js',
			isLoad: false,
		}];
	}
};
window.InterpeterLibsStorage.prototype = Object.create(window.InterpeterStorage);
window.InterpeterLibsStorage.prototype.constructor = window.InterpeterHistory;

window.InterpeterLibsStorage.prototype.LIBS_KEY = 'libs-list';

window.InterpeterLibsStorage.prototype.add = function(newLib) {
	var isExist = this.libs.filter(function(lib) {
		if(lib.name === newLib.name) {
			lib.url = newLib.url;
			lib.isLoad = newLib.isLoad;
			return true;
		}

		return false;
	}).length > 0;

	if(!isExist) {
		this.libs.push({
			name: newLib.name,
			url: newLib.url,
			isLoad: newLib.isLoad
		});
	}

	this.setLibs();
};

window.InterpeterLibsStorage.prototype.remove = function(key) {
	this.libs = this.libs.filter(function(lib) {
		return lib.name === key;
	});

	this.setLibs();
};

window.InterpeterLibsStorage.prototype.clear = function(item) {
	this.libs = [];
	this.setLibs();
};

window.InterpeterLibsStorage.prototype.getLibs = function() {
	return this.libs;
};

window.InterpeterLibsStorage.prototype.setLibs = function() {
	return this.setItem(this.LIBS_KEY, this.libs);
};

window.InterpeterLibsStorage.prototype.isBabelOn = function() {
	for(var i = 0; i < this.libs.length; i++) {
		if(this.libs[i].name === 'Babel for ES6' && this.libs[i].isLoad) {
			return true;
		}
	}

	return false;
};

window.InterpeterLibs = window.InterpeterLibs || {
	libListElement: undefined,
	addLibWrapper: undefined,
	storageLibs: new window.InterpeterLibsStorage,
	init: function() {

		document.getElementById('more-key').addEventListener('click', this.showinitLibs.bind(this));
		document.getElementById('hide-side-bar').addEventListener('click', this.hideinitLibs.bind(this));
		document.getElementById('delete-lib-key').addEventListener('click', this.deleteLib.bind(this));

		document.getElementById('add-key').addEventListener('click', this.showAddLibDialog.bind(this));
		document.getElementById('add-lib-ok').addEventListener('click', this.addLib.bind(this));
		document.getElementById('add-lib-cancel').addEventListener('click', this.hideAddLibDialog.bind(this));

		this.libListElement = document.getElementById('lib-list');
		this.addLibWrapper = document.getElementById('add-lib');
		this.loadLibs();
	},
	isBabelOn: function() {
		return this.storageLibs.isBabelOn();
	},
	loadLibs: function() {
		var self = this;

		this.storageLibs.getLibs().forEach(function(lib) {

			if(lib.isLoad && lib.url) {
				var script = document.createElement('script');
				script.src = lib.url;
				script.onload = function() {
					window.InterpeterMobile.appendToHistoryMsgSuccess('Load ' + lib.name + ' success!');
				};
				script.onerror = function() {
					window.InterpeterMobile.appendToHistoryMsgError('Load ' + lib.name + ' fail!');
				};

				document.body.appendChild(script);
				window.InterpeterMobile.appendToHistoryMsgGrey('Load ' + lib.name + '...');
			}

			self.appendLib(lib);
		});
	},
	appendLib: function(lib) {
		var li = document.createElement('li');
		var label = document.createElement('label');
		var input = document.createElement('input');
		input.name = 'libs-list';
		input.type = 'checkbox';
		input.value = lib.name;
		var span = document.createElement('span');
		span.innerText = lib.name;

		if(lib.isLoad) {
			input.checked = 'checked';
		}

		label.appendChild(input);
		label.appendChild(span);
		li.appendChild(label);

		this.libListElement.appendChild(li);
	},
	setLibsState: function(cb) {
		var checkList = document.getElementsByName('libs-list');
		var isChanged = false;
		this.storageLibs.getLibs().forEach(function(lib) {
			for(var index = 0; index < checkList.length; index++) {
				if(lib.name === checkList[index].value) {
					if(lib.isLoad !== checkList[index].checked) {
						isChanged = true;
					}

					lib.isLoad = checkList[index].checked;
				}
			}
		});

		this.storageLibs.setLibs();

		if(isChanged) {
			setTimeout(function() {
				window.location.search = '?t=' + +new Date();
			}, 100);
		}
	},
	showinitLibs: function(event) {
		document.getElementById('side-bar').className = 'side-bar show';
	},
	hideinitLibs: function(event) {
		var self = this;

		document.getElementById('side-bar').className = 'side-bar';

		setTimeout(function() {
			self.setLibsState();
		}, 400);
	},
	deleteLib: function(event) {
		this.storageLibs.clear();
		window.location.search = '?t=' + +new Date();
	},
	showAddLibDialog: function(event) {
		this.addLibWrapper.className = 'add-lib-wrap show';
		this.hideinitLibs();
	},
	hideAddLibDialog: function(event) {
		this.addLibWrapper.className = 'add-lib-wrap';
	},
	addLib: function(event) {
		var name = document.getElementById('add-lib-name').value;
		var url = document.getElementById('add-lib-url').value;

		if(!name || !url) {
			this.hideAddLibDialog();
			window.InterpeterMobile.appendToHistoryMsgError('please input name & url');
			return;
		}

		this.storageLibs.add({
			name: name,
			url: url,
			isLoad: true
		});

		window.location.search = '?t=' + +new Date();
	}
}

// main
window.InterpeterMobile = window.InterpeterMobile || {
	textarea: undefined,
	historyIndex: 0,
	historyStorage: new window.InterpeterHistory,
	historyStatementWraper: undefined,
	historyPreCode: undefined,
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
		} else if(event.key === 'ArrowDown' || event.keyCode === 40) {
			this.getNextHistoryValue();
		} else {
		}
	},
	onEnterKey: function() {
		var self = this;

		if(!this.textarea.getValue()) {
			return;
		}

		setTimeout(function() {
			self.appendToHistoryInput(self.textarea.getValue());
			
			// 先执行结果，如果有 console，先 console
			var result = self.executeStatement();
			setTimeout(function() {
				// 再输出结果
				self.appendToHistoryResult(result).end();
			}, 0);
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
	evalResult: function(inputValue) {
		var value = inputValue;
		if(window.InterpeterLibs.isBabelOn()) {
			try {
				value = Babel.transform(value, { presets: ['es2015'] }).code.replace('"use strict"', '');
			} catch (exception) {
				throw(exception);
			}
		}

		return eval.call(window, value);
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

		return result;
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
	appendToHistoryResult: function(result) {
		var historyWarper = document.createElement('li');

		var nodeExecuteResult = this.createHostoryElement('execute-result');
		nodeExecuteResult.children[0].innerHTML = result;
		historyWarper.appendChild(nodeExecuteResult);
		this.historyStatementWraper.appendChild(historyWarper);

		return this;
	},
	_appendToHistoryMsg: function(type, msg) {
		var historyWarper = document.createElement('li');

		var nodeStatement = this.createHostoryElement('statement');
		nodeStatement.children[0].innerHTML = '<span class="' + type + '">' + msg + '</span>';
		historyWarper.appendChild(nodeStatement);

		this.historyStatementWraper.appendChild(historyWarper);
	},
	appendToHistoryMsg: function(msg) {
		this._appendToHistoryMsg('', msg);
	},
	appendToHistoryMsgGrey: function(msg) {
		this._appendToHistoryMsg('not-important', msg);
	},
	appendToHistoryMsgSuccess: function(msg) {
		this._appendToHistoryMsg('success', msg);
	},
	appendToHistoryMsgError: function(msg) {
		this._appendToHistoryMsg('error', msg);
	},
	appendToHistoryInput: function(msg) {
		var historyWarper = document.createElement('li');

		var nodeStatement = this.createHostoryElement('statement');
		nodeStatement.children[0].innerText = msg;
		historyWarper.appendChild(nodeStatement);

		this.historyStatementWraper.appendChild(historyWarper);
	},
};

window.onload = function() {
	InterpeterMobile.init();
	InterpeterLibs.init();
};