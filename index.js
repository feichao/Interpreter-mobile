window.InterpeterMobile = window.InterpeterMobile || {
	inputStatementElement: undefined,
	historyStatementWraper: undefined,
	historyPreCode: undefined,
	init: function() {
		this.inputStatementElement = document.getElementById('input-statement');
		this.historyStatementWraper = document.getElementById('history-statement');
		this.historyPreCode = document.getElementById('history-precode');

		this.bindEnterKey();
	},
	bindEnterKey: function() {
		var self = this;
		document.addEventListener('keydown', function(event) {
			if(event.key === 'Enter' || event.keyCode === 13) {
				event.preventDefault();
				setTimeout(function() {
					self.appendToHistory(self.executeStatement());
					self.clearStatement();
				}, 0);
			} else {
				self.resizeInputElement();
			}
		});
	},
	formatResult: function(result) {
		switch(Object.prototype.toString.apply(result)) {
			case '[object Number]':
				return result;
			case '[object Null]':
				return 'null';
			case '[object Undefined]':
				return 'undefined';
			case '[object String]':
				return '\'' + result + '\'';
			case '[object Array]':
			case '[object Object]':
				return JSON.stringify(result);
				return JSON.stringify(result);
			case '[object Function]':
			case '[object RegExp]':
			default:
				return result.toString();
		}
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
			result = exception.message;
		}

		return {
			statement: this.inputStatementElement.value,
			executeResult: result
		};
	},
	resizeInputElement: function() {
		if(this.inputStatementElement.offsetHeight < this.inputStatementElement.scrollHeight) {
			this.inputStatementElement.style.height = this.inputStatementElement.scrollHeight  + 'px';
		}
	},
	clearStatement: function() {
		this.inputStatementElement.value = '';
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
		nodeExecuteResult.children[0].innerText = result.executeResult;
		historyWarper.appendChild(nodeExecuteResult);

		this.historyStatementWraper.appendChild(historyWarper);
	},
};

window.onload = function() {
	InterpeterMobile.init();
};