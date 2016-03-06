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


(function (enyo,scope){
	/**
	 * {@link oarn.PersonList} is a...
	 *
	 * @class oarn.PersonList
	 *
	 * @ui
	 * @public
	 */
	enyo.kind(
		/** @lends oarn.PersonList.prototype */ {

		/**
		 * @private
		 */
		name: 'oarn.PersonList',

			components: [
				{kind: 'Repeater', onSetupItem:'setupItem', components: [
					{name:'item', classes:'repeater-list-item', components: [
						{kind: 'onyx.TooltipDecorator', components:[
							{name: 'name_label', kind:'enyo.Control', components: [
								{name: 'person_id', tag: 'span'},
								{name: 'last_name', tag: 'span'},
								{name: 'first_name', tag: 'span'},
							]},
							{kind: 'onyx.Tooltip', components: [
								{tag:'span', content: 'DOB: '},
								{tag:'span', name: 'birth_date'},
								{tag:'br'},
								{tag:'span', content: 'Programs: '},
								{tag:'span', name: 'programs'}
							]}
						]}

					]}
				]}
			],
			create: function() {
				this.inherited(arguments);
				this.$.repeater.setCount(this.people.length);
			},
			setupItem: function(inSender, inEvent) {
				var index = inEvent.index;
				var item = inEvent.item;
				var person = this.people[index];

				item.$.person_id.setContent(person.person_id + ' - ');
				item.$.last_name.setContent(person.last_name + ', ');
				item.$.first_name.setContent(person.first_name);
				item.$.birth_date.setContent(person.birth_date);
				item.$.programs.setContent(person.programs);

				if (person.primary) {
					item.$.name_label.addClass('repeater-list-item-primary');
				} else {
					enyo.log(person.person_id + ' is not a primary');
				}

				//item.$.personNumber.setContent((index+1) + ". ");
				//item.$.personName.setContent(person.name);
				//item.$.personName.applyStyle("color", person.sex == "male" ? "dodgerblue" : "deeppink");
				//item.$.item_tip.setContent(person.sex);
				/* stop propagation */
				return true;
			},
			people: [
				{person_id: 123, first_name: 'John', last_name: 'Smith', birth_date: '1987-5-01',
				 primary: false, currently_enrolled: true, programs:'TherClassroom'},
				{person_id: 87, first_name: 'Mary', last_name: 'Green', birth_date: '2011-5-01',
					primary: false, currently_enrolled: true, programs:'TherClassroom'},
				{person_id: 323, first_name: 'John', last_name: 'Smith', birth_date: '1987-5-01',
					primary: true, currently_enrolled: true, programs:'TherClassroom'},
				{person_id: 143, first_name: 'John', last_name: 'Smith', birth_date: '1987-5-01',
					primary: false, currently_enrolled: true, programs:'TherClassroom'},
				{person_id: 19, first_name: 'John', last_name: 'Smith', birth_date: '1987-5-01',
					primary: true, currently_enrolled: true, programs:'TherClassroom'},
				{person_id: 87, first_name: 'John', last_name: 'Smith', birth_date: '1987-5-01',
					primary: false, currently_enrolled: true, programs:'TherClassroom'},
				{person_id: 155, first_name: 'John', last_name: 'Smith', birth_date: '1987-5-01',
					primary: false, currently_enrolled: true, programs:'TherClassroom'},
				{person_id: 14, first_name: 'John', last_name: 'Smith', birth_date: '1987-5-01',
					primary: false, currently_enrolled: true, programs:'TherClassroom'}
			]
	})

}) (enyo, this);
