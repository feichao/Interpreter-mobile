window.InterpeterLog = window.InterpeterLog = {};
(function() {
	for(var key in console) {
		window.InterpeterLog[key] = console[key];

		console[key] = (function() {
			var keyClusore = key;
			return function(str) {
				window.InterpeterLog[keyClusore](str);
				InterpeterMobile.logStr.push(str);
			}
		})();
	}
})();

window.InterpeterMobile = window.InterpeterMobile || {
	inputStatementElement: undefined,
	historyStatementWraper: undefined,
	historyPreCode: undefined,
	logStr: [],
	init: function() {
		this.inputStatementElement = document.getElementById('input-statement');
		this.historyStatementWraper = document.getElementById('history-statement');
		this.historyPreCode = document.getElementById('history-precode');

		this.bindEvent();
	},
	inputChange: function(event) {
		var self = this;
		
		if(event.key === 'Enter' || event.keyCode === 13) {
			event.preventDefault();
			if(!this.inputStatementElement.value) {
				return;
			}

			setTimeout(function() {
				self.appendToHistory(self.executeStatement());
				self.clearStatement();
			}, 0);
		} else {
			this.resizeInputElement();
			this.logStr = [];
		}
	},
	bindEvent: function() {
		document.addEventListener('input', this.inputChange.bind(this));
		document.addEventListener('keydown', this.inputChange.bind(this));
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
		this.logStr.push(result);
		return this.logStr.join('<br/>');
	},
	evalResult: function(inputValue) {
		return eval.call(window, inputValue);
	},
	executeStatement: function() {
		var result;

		try {
			if(/^\{.*\}$/.test(this.inputStatementElement.value)) {
				this.evalResult('var _1_a_2_d_3_i_4_x_5_m_6_y_7_w_8_ = ' + this.inputStatementElement.value);
				result = this.formatResult(window._1_a_2_d_3_i_4_x_5_m_6_y_7_w_8_);
			} else {
				result = this.formatResult(this.evalResult(this.inputStatementElement.value));
			}
		} catch(exception) {
			result = '<span class="error">' + exception.message + '</span>';
		}

		return {
			statement: this.inputStatementElement.value,
			executeResult: this.appendLogInfo(result)
		};
	},
	resizeInputElement: function() {
		if(this.inputStatementElement.offsetHeight < this.inputStatementElement.scrollHeight) {
			this.inputStatementElement.style.height = this.inputStatementElement.scrollHeight  + 'px';
		}
	},
	clearStatement: function() {
		this.inputStatementElement.value = '';
		this.inputStatementElement.style.height = 'auto';
	},
	createHostoryElement: function(type) {
		var pre = document.createElement('pre');
		pre.className = 'history history-' + type;

		var code = document.createElement('code');
		pre.appendChild(code);

		return pre;
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
	},
};  

window.onload = function() {
	InterpeterMobile.init();
};