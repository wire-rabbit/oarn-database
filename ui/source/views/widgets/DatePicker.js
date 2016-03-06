//  The OARN Relief Nursery Database
//  Copyright (C) 2015  Oregon Association of Relief Nurseries
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Affero General Public License as
//  published by the Free Software Foundation, either version 3 of the
//  License, or (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Affero General Public License for more details.
//
//  You should have received a copy of the GNU Affero General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function (enyo, scope) {
	/**
	 * {@link oarn.DatePicker} is a simple Enyo wrapper for a jQuery UI date picker.
	 *
	 * @class oarn.DatePicker
	 * @extends enyo.Control
	 * @ui
	 */
	enyo.kind({
		name: 'oarn.DatePicker',
		classes: 'oarn-control',

		published: {
			value: '',
			width: '',
			backgroundColor: '',
			emptyIsValid: false
		},

		bindings: [
			{from: '.value', to: '.$.inputDate.value', oneWay: false}
		],

		events: {
			onInput: '',

			onchange: '',

			oninput: ''
		},

		components: [
			{kind: "enyo.Input", name: "inputDate", classes: 'datepicker', type: "text", oninput: 'inputOccurred'}
		],

		rendered: function() {
			this.inherited(arguments);

			$('#' + this.$.inputDate.id).datepicker({
				onSelect: enyo.bind(this, 'dateSelected')
			});

			this.widthChanged();
			this.backgroundColorChanged();
		},

		inputOccurred: function(inSender, inEvent) {
			this.$.inputDate.addRemoveClass('oarn-invalid-input', !this.validateDate(this.$.inputDate.getValue()));
			this.doInput();
		},

		validateDate: function (testdate) {
			// thanks to: noirbizzare -
			// http://stackoverflow.com/questions/15196451/regular-expression-to-validate-datetime-format-mm-dd-yyyy

			if (testdate.length == 0) {
				if (this.get('.emptyIsValid')) {
					return true;
				}
				else {
					return false;
				}
			}
			var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/ ;
			return date_regex.test(testdate);
		},

		dateSelected: function (dateText, obj) {
			this.$.inputDate.setValue(dateText);
			this.inputOccurred();
		},

		widthChanged: function() {
			this.$.inputDate.applyStyle('width', this.get('.width'));
		},

		backgroundColorChanged: function () {
			this.$.inputDate.applyStyle('backgroundColor', this.get('.backgroundColor'));
		}
	});

})(enyo, this);
