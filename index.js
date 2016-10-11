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
				self.appendToHistory(self.executeStatement());
				self.clearStatement();
			} else {
				self.resizeInputElement();
			}
		});
	},
	executeStatement: function() {
		return {
			statement: this.inputStatementElement.value,
			executeResult: eval(this.inputStatementElement.value)
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
		var nodeStatement = this.createHostoryElement('statement');
		nodeStatement.children[0].innerText = result.statement;
		this.historyStatementWraper.appendChild(nodeStatement);

		var nodeExecuteResult = this.createHostoryElement('execute-result');
		nodeExecuteResult.children[0].innerText = result.executeResult;
		this.historyStatementWraper.appendChild(nodeExecuteResult);
	},
};

window.onload = function() {
	InterpeterMobile.init();
};