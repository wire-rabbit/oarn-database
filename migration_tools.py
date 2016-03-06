# The OARN Relief Nursery Database
# Copyright (C) 2015  Oregon Association of Relief Nurseries
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import xlrd, random, math
from datetime import date, datetime, timedelta
from django.core.exceptions import MultipleObjectsReturned
from django.db import models
from django.db.models import Q
from django.apps import apps
from django.contrib.auth.models import User, Group

from oarndb.models import MigrationPerson, MigrationFamily
from oarndb.models import Organization, OrganizationLocation, OrganizationPersonRole, OrganizationFamilyLink
from oarndb.models import Person, Family, Adult, Child, AdultFamilyRelationship, ChildFamilyRelationship
from oarndb.models import PersonRace
from oarndb.models import RefGender, RefAdultFamilyRelationshipType, RefChildFamilyRelationshipType
from oarndb.models import RefLanguage, RefLanguageUseType, RefEmailType, RefRole
from oarndb.models import RefProgram, RefServiceLevel, RefState, RefCounty, RefLocationType

col_types = ['int', 'float', 'date', 'text', 'choice', 'boolean']
INT = 0
FLOAT = 1
DATE = 2
TEXT = 3
CHOICE = 4
BOOLEAN = 5


class ColumnSpec():
    """
    Defines an individual column of a worksheet and its requirements
    """
    def __init__(self, col_no=0, header_text='Not Set', col_type=0, allow_null=False, max_text_size=10000,
                 choice_list=[]):
        self.col_no = col_no # The column number
        self.header_text = header_text # Expected in the first row of the column
        self.col_type = col_type # Must be some instance of col_types
        self.allow_null = allow_null
        self.max_text_size = max_text_size
        self.choice_list=choice_list

organization_specs = []
organization_specs.append(ColumnSpec(col_no=0, header_text='name', col_type=TEXT, allow_null=False))
organization_specs.append(ColumnSpec(col_no=1, header_text='short_name', col_type=TEXT, allow_null=False))
organization_specs.append(ColumnSpec(col_no=2, header_text='abbreviation', col_type=TEXT, allow_null=False))

orglocation_specs = []
orglocation_specs.append(ColumnSpec(col_no=0, header_text='name', col_type=TEXT, allow_null=False))
orglocation_specs.append(ColumnSpec(col_no=1, header_text='short_name', col_type=TEXT, allow_null=False))
orglocation_specs.append(ColumnSpec(col_no=2, header_text='street_number_and_name', col_type=TEXT, allow_null=False))
orglocation_specs.append(ColumnSpec(col_no=3, header_text='apartment_room_or_suite_number',
                                    col_type=TEXT, allow_null=True))
orglocation_specs.append(ColumnSpec(col_no=4, header_text='city', col_type=TEXT, allow_null=False))
orglocation_specs.append(ColumnSpec(col_no=5, header_text='state', col_type=CHOICE, allow_null=False, choice_list=[]))
orglocation_specs.append(ColumnSpec(col_no=6, header_text='postal_code', col_type=TEXT, allow_null=False))
orglocation_specs.append(ColumnSpec(col_no=7, header_text='county', col_type=CHOICE, allow_null=False, choice_list=[]))

client_specs = []
client_specs.append(ColumnSpec(col_no=0, header_text='person_id', col_type=TEXT, allow_null=False))
client_specs.append(ColumnSpec(col_no=1, header_text='first_name', col_type=TEXT, allow_null=False))
client_specs.append(ColumnSpec(col_no=2, header_text='middle_name', col_type=TEXT, allow_null=True))
client_specs.append(ColumnSpec(col_no=3, header_text='last_name', col_type=TEXT, allow_null=False))
client_specs.append(ColumnSpec(col_no=4, header_text='generation_code', col_type=TEXT, allow_null=True))
client_specs.append(ColumnSpec(col_no=5, header_text='prefix', col_type=TEXT, allow_null=True))
client_specs.append(ColumnSpec(col_no=6, header_text='birth_date', col_type=DATE, allow_null=True))
client_specs.append(ColumnSpec(col_no=7, header_text='gender', col_type=CHOICE, allow_null=True, choice_list=[]))
client_specs.append(ColumnSpec(col_no=8, header_text='hispanic_latino_ethnicity', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=9, header_text='american_indian', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=10, header_text='asian', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=11, header_text='black', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=12, header_text='pacific', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=13, header_text='white', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=14, header_text='multiracial', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=15, header_text='unreported', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=16, header_text='other', col_type=BOOLEAN, allow_null=True))
client_specs.append(ColumnSpec(col_no=17, header_text='other_details', col_type=TEXT, allow_null=True))
client_specs.append(ColumnSpec(col_no=18, header_text='is_child', col_type=BOOLEAN, allow_null=False))

staff_specs = []
staff_specs.append(ColumnSpec(col_no=0, header_text='person_id', col_type=TEXT, allow_null=False))
staff_specs.append(ColumnSpec(col_no=1, header_text='first_name', col_type=TEXT, allow_null=False))
staff_specs.append(ColumnSpec(col_no=2, header_text='middle_name', col_type=TEXT, allow_null=True))
staff_specs.append(ColumnSpec(col_no=3, header_text='last_name', col_type=TEXT, allow_null=False))
staff_specs.append(ColumnSpec(col_no=4, header_text='generation_code', col_type=TEXT, allow_null=True))
staff_specs.append(ColumnSpec(col_no=5, header_text='prefix', col_type=TEXT, allow_null=True))
staff_specs.append(ColumnSpec(col_no=6, header_text='birth_date', col_type=DATE, allow_null=True))
staff_specs.append(ColumnSpec(col_no=7, header_text='gender', col_type=CHOICE, allow_null=True, choice_list=[]))
staff_specs.append(ColumnSpec(col_no=8, header_text='role', col_type=CHOICE, allow_null=True, choice_list=[]))

afr_specs = []
afr_specs.append(ColumnSpec(col_no=0, header_text='person_id', col_type=TEXT, allow_null=False))
afr_specs.append(ColumnSpec(col_no=1, header_text='family_id', col_type=TEXT, allow_null=False))
afr_specs.append(ColumnSpec(col_no=2, header_text='relationship_type', col_type=CHOICE, allow_null=True,
                            choice_list=[]))
afr_specs.append(ColumnSpec(col_no=3, header_text='relationship_begin_date', col_type=DATE, allow_null=True))
afr_specs.append(ColumnSpec(col_no=4, header_text='relationship_end_date', col_type=DATE, allow_null=True))
afr_specs.append(ColumnSpec(col_no=5, header_text='notes', col_type=TEXT, allow_null=True))
afr_specs.append(ColumnSpec(col_no=6, header_text='is_primary', col_type=BOOLEAN, allow_null=False))

cfr_specs = []
cfr_specs.append(ColumnSpec(col_no=0, header_text='person_id', col_type=TEXT, allow_null=False))
cfr_specs.append(ColumnSpec(col_no=1, header_text='family_id', col_type=TEXT, allow_null=False))
cfr_specs.append(ColumnSpec(col_no=2, header_text='relationship_type', col_type=CHOICE, allow_null=True,
                            choice_list=[]))
cfr_specs.append(ColumnSpec(col_no=3, header_text='relationship_begin_date', col_type=DATE, allow_null=True))
cfr_specs.append(ColumnSpec(col_no=4, header_text='relationship_end_date', col_type=DATE, allow_null=True))
cfr_specs.append(ColumnSpec(col_no=5, header_text='notes', col_type=TEXT, allow_null=True))

language_specs = []
language_specs.append(ColumnSpec(col_no=0, header_text='person_id', col_type=TEXT, allow_null=False))
language_specs.append(ColumnSpec(col_no=1, header_text='language', col_type=CHOICE, allow_null=False,
                            choice_list=[]))
language_specs.append(ColumnSpec(col_no=2, header_text='language_use_type', col_type=CHOICE, allow_null=False,
                            choice_list=[]))
language_specs.append(ColumnSpec(col_no=3, header_text='other_details', col_type=TEXT, allow_null=True))

email_specs = []
email_specs.append(ColumnSpec(col_no=0, header_text='person_id', col_type=TEXT, allow_null=False))
email_specs.append(ColumnSpec(col_no=1, header_text='email_address', col_type=TEXT, allow_null=False))
email_specs.append(ColumnSpec(col_no=2, header_text='email_type', col_type=TEXT, allow_null=True))

program_specs = []
program_specs.append(ColumnSpec(col_no=0, header_text='family_enrollment_id', col_type=TEXT, allow_null=False))
program_specs.append(ColumnSpec(col_no=1, header_text='family_id', col_type=TEXT, allow_null=False))
program_specs.append(ColumnSpec(col_no=2, header_text='program', col_type=CHOICE, allow_null=True, choice_list=[]))
program_specs.append(ColumnSpec(col_no=3, header_text='location', col_type=CHOICE, allow_null=True, choice_list=[]))
program_specs.append(ColumnSpec(col_no=4, header_text='open_date', col_type=DATE, allow_null=True))
program_specs.append(ColumnSpec(col_no=5, header_text='close_date', col_type=DATE, allow_null=True))

servicelevel_specs = []
servicelevel_specs.append(ColumnSpec(col_no=0, header_text='family_enrollment_id', col_type=TEXT, allow_null=False))
servicelevel_specs.append(ColumnSpec(col_no=1, header_text='service_level', col_type=CHOICE,
                                     allow_null=True, choice_list=[]))
servicelevel_specs.append(ColumnSpec(col_no=2, header_text='open_date', col_type=DATE, allow_null=False))
servicelevel_specs.append(ColumnSpec(col_no=3, header_text='close_date', col_type=DATE, allow_null=True))

individualenrollment_specs = []
individualenrollment_specs.append(ColumnSpec(col_no=0, header_text='person_id', col_type=TEXT, allow_null=False))
individualenrollment_specs.append(ColumnSpec(col_no=1, header_text='family_enrollment_id',
                                             col_type=TEXT, allow_null=False))
individualenrollment_specs.append(ColumnSpec(col_no=2, header_text='open_date', col_type=DATE, allow_null=False))
individualenrollment_specs.append(ColumnSpec(col_no=3, header_text='close_date', col_type=DATE, allow_null=True))
individualenrollment_specs.append(ColumnSpec(col_no=4, header_text='is_child', col_type=BOOLEAN, allow_null=False))

casemanager_specs = []
casemanager_specs.append(ColumnSpec(col_no=0, header_text='family_id', col_type=TEXT, allow_null=False))
casemanager_specs.append(ColumnSpec(col_no=1, header_text='person_id',
                                             col_type=TEXT, allow_null=False))
casemanager_specs.append(ColumnSpec(col_no=2, header_text='begin_date', col_type=DATE, allow_null=False))
casemanager_specs.append(ColumnSpec(col_no=3, header_text='end_date', col_type=DATE, allow_null=True))

address_specs = []
address_specs.append(ColumnSpec(col_no=0, header_text='family_id', col_type=TEXT, allow_null=False))
address_specs.append(ColumnSpec(col_no=1, header_text='location_type', col_type=CHOICE,
                                     allow_null=True, choice_list=[]))
address_specs.append(ColumnSpec(col_no=2, header_text='street_number_and_name', col_type=TEXT, allow_null=False))
address_specs.append(ColumnSpec(col_no=3, header_text='apartment_room_or_suite_number',
                                    col_type=TEXT, allow_null=True))
address_specs.append(ColumnSpec(col_no=4, header_text='city', col_type=TEXT, allow_null=False))
address_specs.append(ColumnSpec(col_no=5, header_text='state', col_type=TEXT, allow_null=False))
address_specs.append(ColumnSpec(col_no=6, header_text='postal_code', col_type=TEXT, allow_null=False))
address_specs.append(ColumnSpec(col_no=7, header_text='county', col_type=TEXT, allow_null=True))
address_specs.append(ColumnSpec(col_no=8, header_text='residence_end_date', col_type=DATE, allow_null=True))
address_specs.append(ColumnSpec(col_no=9, header_text='primary_address', col_type=BOOLEAN, allow_null=False))
address_specs.append(ColumnSpec(col_no=10, header_text='notes', col_type=TEXT, allow_null=True))


def get_cell_name(row, col):
        """
        For reporting errors, returns "[A:0]" for 0,0, etc.
        :param row:
        :param col:
        :return:
        """
        letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
                   'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

        if col < 26:
            return "[" + letters[col] + ":" + str(row + 1) + "]"
        else:
            return "[" + (col + 1) + ":" + str(row + 1) + "]"


def worksheet_is_valid(sheet, specs):
        """
        Returns True if the given worksheet is valid for the supplied specs, False otherwise.
        :param worksheet:
        :param specs: an array of ColumnSpec objects
        :return:True if valid, False otherwise
        """
        letter_map = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']
        for col in specs:
            if sheet.cell_value(0,col.col_no) != col.header_text:
                print("Column " + letter_map[col.col_no] + " requires a " + col.header_text + " header")
                print("was: " + sheet.cell_value(0, col.col_no))
                return False

            # If the col_type is 'int', verify that everything in the column is an integer:
            for row in range(sheet.nrows):
                if row > 0:
                    if sheet.cell_type(row, col.col_no) == 0:
                        if not col.allow_null:
                            print("'"+ col.header_text + "' values cannot be null: " +
                                get_cell_name(row, col.col_no))
                            return False
                    else:
                        if col_types[col.col_type] == 'int':
                            try:
                                int(sheet.cell_value(row,col.col_no))
                            except ValueError:
                                print("'"+ col.header_text + "' values must be integers: " +
                                    get_cell_name(row, col.col_no))
                                return False

                        if col_types[col.col_type] == 'float':
                            try:
                                float(sheet.cell_value(row,col.col_no))
                            except ValueError:
                                print("'"+ col.header_text + "' values must be numbers: " +
                                    get_cell_name(row, col.col_no))
                                return False

                        if col_types[col.col_type] == 'date':
                            if sheet.cell_type(row, col.col_no) != 3:
                                print("'"+ col.header_text + "' values must be formatted as Excel dates: " +
                                    get_cell_name(row, col.col_no))
                                return False

                        if col_types[col.col_type] == 'choice':
                            if (sheet.cell_value(row, col.col_no)) not in col.choice_list:
                                print("'"+ col.header_text + "' values must be in [" + str(col.choice_list) + "] " +
                                    " : " + get_cell_name(row, col.col_no))
                                return False

                        if col_types[col.col_type] == 'boolean':
                            if (sheet.cell_value(row, col.col_no)) not in [1, 0]:
                                print("'"+ col.header_text + "' values must be in [1, 0]" +
                                    " : " + get_cell_name(row, col.col_no))
                                return False

        return True


def validate(path, org):
    """
    Assumes that the ref tables have already been migrated.

    :param path:
    :return:
    """

    MigrationOrganization = org

    locationtype_list = []
    for lt in RefLocationType.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        locationtype_list.append(lt.description)
    address_specs[1].choice_list = locationtype_list

    state_list = []
    for s in RefState.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        state_list.append(s.code)
    orglocation_specs[5].choice_list = state_list
    address_specs[5].choice_list = state_list

    county_list = []
    for c in RefCounty.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        county_list.append(c.description)
    orglocation_specs[7].choice_list = county_list
    address_specs[7].choice_list = county_list

    genders_list = []
    for g in RefGender.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        genders_list.append(g.description)
    client_specs[7].choice_list = genders_list
    staff_specs[7].choice_list = genders_list

    afr_list = []
    for afr in RefAdultFamilyRelationshipType.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        afr_list.append(afr.description)
    afr_specs[2].choice_list = afr_list

    cfr_list = []
    for cfr in RefChildFamilyRelationshipType.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        cfr_list.append(cfr.description)
    cfr_specs[2].choice_list = cfr_list

    lang_list = []
    for lang in RefLanguage.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        lang_list.append(lang.description)
    language_specs[1].choice_list = lang_list

    lang_use_list = []
    for lang_use in RefLanguageUseType.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        lang_use_list.append(lang_use.description)
    language_specs[2].choice_list = lang_use_list

    email_type_list = []
    for et in RefEmailType.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        email_type_list.append(et.description)
    email_specs[2].choice_list = email_type_list

    role_list = []
    for role in RefRole.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        role_list.append(role.description)
    staff_specs[8].choice_list = role_list

    program_list = []
    for program in RefProgram.objects.filter(Q(universal=True) | Q(organization=MigrationOrganization)):
        program_list.append(program.description)
    program_specs[2].choice_list = program_list

    location_list = []
    for location in OrganizationLocation.objects.filter(organization=MigrationOrganization):
        location_list.append(location.short_name)
    program_specs[3].choice_list = location_list

    servicelevel_list = []
    for sl in RefServiceLevel.objects.all():
        servicelevel_list.append(sl.description)
    servicelevel_specs[1].choice_list = servicelevel_list

    workbook = xlrd.open_workbook(path + "organization.xlsx")

    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, organization_specs):
        print('organization.organization is valid')
    else:
        print('organization.organization is not valid')

    sheet = workbook.sheet_by_index(1)
    if worksheet_is_valid(sheet, orglocation_specs):
        print('organization.locations is valid')
    else:
        print('organization.locations is not valid')

    workbook = xlrd.open_workbook(path + "clients.xlsx")

    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, client_specs):
        print('clients.clients is valid')
    else:
        print('clients.clients is not valid')

    sheet = workbook.sheet_by_index(1)
    if worksheet_is_valid(sheet, afr_specs):
        print('clients.adult_family_relationships is valid')
    else:
        print('clients.adult_family_relationships is not valid')

    sheet = workbook.sheet_by_index(2)
    if worksheet_is_valid(sheet, cfr_specs):
        print('clients.child_family_relationships is valid')
    else:
        print('clients.child_family_relationships is not valid')

    sheet = workbook.sheet_by_index(3)
    if worksheet_is_valid(sheet, language_specs):
        print('clients.languages is valid')
    else:
        print('clients.languages is not valid')

    sheet = workbook.sheet_by_index(4)
    if worksheet_is_valid(sheet, email_specs):
        print('clients.email is valid')
    else:
        print('clients.email is not valid')

    workbook = xlrd.open_workbook(path + "staff.xlsx")

    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, staff_specs):
        print('staff is valid')
    else:
        print('staff is not valid')

    workbook = xlrd.open_workbook(path + "enrollment.xlsx")

    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, program_specs):
        print('enrollment.family_enrollment is valid')
    else:
        print('enrollment.family_enrollment is not valid')

    sheet = workbook.sheet_by_index(1)
    if worksheet_is_valid(sheet, servicelevel_specs):
        print('enrollment.service_level_enrollment is valid')
    else:
        print('enrollment.service_level_enrollment is not valid')

    sheet = workbook.sheet_by_index(2)
    if worksheet_is_valid(sheet, individualenrollment_specs):
        print('enrollment.individual_enrollment is valid')
    else:
        print('enrollment.individual_enrollment is not valid')

    sheet = workbook.sheet_by_index(3)
    if worksheet_is_valid(sheet, casemanager_specs):
        print('enrollment.case_managers is valid')
    else:
        print('enrollment.case_managers is not valid')

    workbook = xlrd.open_workbook(path + "addresses.xlsx")

    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, address_specs):
        print('addresses is valid')
    else:
        print('addresses is not valid')


def full_reftable_migration(path='csv/production/reference_tables.xlsx'):
        workbook = xlrd.open_workbook(path)
        sheet_names = workbook.sheet_names()
        sheet_data = []
        for i in sheet_names:
            sheet_data.append(i)

        specs = []
        specs.append(
            ColumnSpec(
                col_no=0,
                header_text='description',
                col_type=TEXT,
                allow_null=False
            )
        )

        specs.append(
            ColumnSpec(
                col_no=1,
                header_text='code',
                col_type=TEXT,
                allow_null=False
            )
        )

        specs.append(
            ColumnSpec(
                col_no=2,
                header_text='sort_order',
                col_type=INT,
                allow_null=False
            )
        )

        for sheet_no in range(0, len(sheet_data)):
            sheet = workbook.sheet_by_index(sheet_no)
            sheet.cell_value(0,0)
            try:
                refmodel = apps.get_model(app_label='oarndb', model_name=sheet_names[sheet_no])
            except LookupError:
                print("Sheet " + str(sheet_no) + " is named after a non-existent model.")
                return
            if worksheet_is_valid(sheet, specs):
                refmodel.objects.all().delete()
                for row in range(sheet.nrows):
                    if row > 0:
                        refmodel.objects.create(
                            description=sheet.cell_value(row, 0),
                            code=sheet.cell_value(row, 1),
                            sort_order=sheet.cell_value(row, 2),
                            universal=True
                        )

                print("Finished: " + sheet_names[sheet_no])


def migrate_clients(path, org):
    genders_list = []
    for g in RefGender.objects.filter(Q(universal=True) | Q(organization=org)):
        genders_list.append(g.description)
    client_specs[7].choice_list = genders_list

    role_list = []
    for role in RefRole.objects.filter(Q(universal=True) | Q(organization=org)):
        role_list.append(role.description)
    client_specs[8].choice_list = role_list

    workbook = xlrd.open_workbook(path + "clients.xlsx")
    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, client_specs):
        print('clients.clients is valid')
    else:
        print('clients.clients is not valid')
        return False

    try:
        ref_role = RefRole.objects.get(description='Client')
    except RefRole.DoesNotExist:
        print('A "Client" role must exist!')
        return False

    for row in range(sheet.nrows):
        if row > 0:
            # person fields:
            person_id = sheet.cell_value(row, 0)
            first_name = sheet.cell_value(row, 1)
            if sheet.cell_type(row, 2) != 0:
                middle_name = sheet.cell_value(row, 2)
            else:
                middle_name = None
            last_name = sheet.cell_value(row, 3)
            if sheet.cell_type(row, 4) != 0:
                generation_code = sheet.cell_value(row, 4)
            else:
                generation_code = None
            if sheet.cell_type(row, 5) != 0:
                prefix = sheet.cell_value(row, 5)
            else:
                prefix = None
            if sheet.cell_type(row, 6) != 0:
                raw_begin_date = sheet.cell_value(row, 6)
                time_tuple = xlrd.xldate_as_tuple(raw_begin_date, 0)
                birth_date = datetime(*time_tuple)
            else:
                birth_date = None
            if sheet.cell_type(row, 7) != 0:
                ref_gender = RefGender.objects.get(description=sheet.cell_value(row, 7))
            else:
                ref_gender = None

            # person_race fields:
            hispanic = False
            if sheet.cell_type(row, 8) != 0:
                if sheet.cell_value(row, 8) == 1:
                    hispanic = True

            american_indian = False
            if sheet.cell_type(row, 9) != 0:
                if sheet.cell_value(row, 9) == 1:
                    american_indian = True

            asian = False
            if sheet.cell_type(row, 10) != 0:
                if sheet.cell_value(row, 10) == 1:
                    asian = True

            black = False
            if sheet.cell_type(row, 11) != 0:
                if sheet.cell_value(row, 11) == 1:
                    black = True

            pacific = False
            if sheet.cell_type(row, 12) != 0:
                if sheet.cell_value(row, 12) == 1:
                    pacific = True

            white = False
            if sheet.cell_type(row, 13) != 0:
                if sheet.cell_value(row, 13) == 1:
                    white = True

            multiracial = False
            if sheet.cell_type(row, 14) != 0:
                if sheet.cell_value(row, 14) == 1:
                    multiracial = True

            unreported = False
            if sheet.cell_type(row, 15) != 0:
                if sheet.cell_value(row, 15) == 1:
                    unreported = True

            other = False
            if sheet.cell_type(row, 16) != 0:
                if sheet.cell_value(row, 16) == 1:
                    other = True

            other_details = None
            if sheet.cell_type(row, 17) != 0:
                other_details = sheet.cell_value(row, 17)

            is_child = False
            if sheet.cell_type(row, 18) != 0:
                if sheet.cell_value(row, 18) == 1:
                    is_child = True

            person = Person.objects.create(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                generation_code=generation_code,
                prefix=prefix,
                birth_date=birth_date,
                ref_gender=ref_gender
            )
            print(person, end=' +++ ')

            race = PersonRace.objects.create(
                person=person,
                hispanic_latino_ethnicity=hispanic,
                american_indian=american_indian,
                asian=asian,
                black=black,
                pacific=pacific,
                white=white,
                multiracial=multiracial,
                unreported=unreported,
                other=other,
                other_details=other_details
            )

            if is_child == 1:
                child = Child.objects.create(person=person)
            else:
                adult = Adult.objects.create(person=person)

            organization_person_role = OrganizationPersonRole.objects.create(
                organization=org,
                person=person,
                ref_role=ref_role
            )
            print(organization_person_role, end=' +++ ')

            # Create the Migration record:
            MigrationPerson.objects.create(
                organization=org,
                old_pk=person_id,
                person=person,
                is_child=is_child,
                mode="client"
            )

    print('client migration complete...')
    return True



def migrate_staff(path, org):
    genders_list = []
    for g in RefGender.objects.filter(Q(universal=True) | Q(organization=org)):
        genders_list.append(g.description)
    staff_specs[7].choice_list = genders_list

    role_list = []
    for role in RefRole.objects.filter(Q(universal=True) | Q(organization=org)):
        role_list.append(role.description)
    staff_specs[8].choice_list = role_list

    workbook = xlrd.open_workbook(path + "staff.xlsx")

    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, staff_specs):
        print('staff is valid')
    else:
        print('staff is not valid')
        return False

    for row in range(sheet.nrows):
        if row > 0:
            person_id = sheet.cell_value(row, 0)
            first_name = sheet.cell_value(row, 1)
            if sheet.cell_type(row, 2) != 0:
                middle_name = sheet.cell_value(row, 2)
            else:
                middle_name = None
            last_name = sheet.cell_value(row, 3)
            if sheet.cell_type(row, 4) != 0:
                generation_code = sheet.cell_value(row, 4)
            else:
                generation_code = None
            if sheet.cell_type(row, 5) != 0:
                prefix = sheet.cell_value(row, 5)
            else:
                prefix = None
            if sheet.cell_type(row, 6) != 0:
                raw_begin_date = sheet.cell_value(row, 6)
                time_tuple = xlrd.xldate_as_tuple(raw_begin_date, 0)
                birth_date = datetime(*time_tuple)
            else:
                birth_date = None
            if sheet.cell_type(row, 7) != 0:
                ref_gender = RefGender.objects.get(description=sheet.cell_value(row, 7))
            else:
                ref_gender = None
            if sheet.cell_type(row, 8) != 0:
                ref_role = RefRole.objects.get(description=sheet.cell_value(row, 8))
            else:
                ref_role = None

            # Create the Person record:
            person = Person.objects.create(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                generation_code=generation_code,
                prefix=prefix,
                birth_date=birth_date,
                ref_gender=ref_gender
            )
            print(person, end=' +++ ')

            # Create the OrganizationPersonRole record:
            organization_person_role = OrganizationPersonRole.objects.create(
                organization=org,
                person=person,
                ref_role=ref_role
            )
            print(organization_person_role, end=' +++ ')

            # Create the Adult or Child record:
            adult = Adult.objects.create(person=person)
            print(adult, end=' +++ ')

            # Create the Migration record:
            MigrationPerson.objects.create(
                organization=org,
                old_pk=person_id,
                person=person,
                is_child=False,
                mode="staff"
            )

    print('staff migration complete...')
    return True


def migrate_child_family_relationships(path, org):
    #path = 'csv/production/demo_schema/'
    #org = Organization.objects.all().first()

    cfr_list = []
    for cfr in RefChildFamilyRelationshipType.objects.filter(Q(universal=True) | Q(organization=org)):
        cfr_list.append(cfr.description)
    cfr_specs[2].choice_list = cfr_list

    workbook = xlrd.open_workbook(path + "clients.xlsx")
    sheet = workbook.sheet_by_index(2)
    if worksheet_is_valid(sheet, cfr_specs):
        print('clients.child_family_relationships is valid')
    else:
        print('clients.child_family_relationships is not valid')
        return False

    for row in range(sheet.nrows):
        if row > 0:
            # Get the person record for the row
            old_id = sheet.cell_value(row, 0)
            try:
                person = MigrationPerson.objects.filter(is_child=1).filter(organization=org).get(old_pk=old_id).person
            except MigrationPerson.DoesNotExist:
                print('MigrationPerson record does not exist: ' + get_cell_name(row, 0))
                continue

            # Does this old family record have a new database counterpart yet?
            family_id = sheet.cell_value(row, 1)
            if MigrationFamily.objects.filter(old_family_id=family_id).filter(organization=org).count() > 0:
                # If so, get it:
                family = MigrationFamily.objects.get(Q(old_family_id=family_id) & Q(organization=org)).family
            else:
                # If not, we can't have a family with only children in it, so:
                print('Family must exist for child relationship records:' + get_cell_name(row, 1))
                continue

            ref_relationship_type = None
            if sheet.cell_type(row, 2) != 0:
                try:
                    ref_relationship_type = RefChildFamilyRelationshipType.objects.get(
                        description=sheet.cell_value(row, 2))
                except RefChildFamilyRelationshipType.DoesNotExist:
                    print('Relationship type does not exist: ' + get_cell_name(row, 2))
                    ref_relationship_type = None

            if sheet.cell_type(row, 3) != 0:
                raw_begin_date = sheet.cell_value(row, 3)
                time_tuple = xlrd.xldate_as_tuple(raw_begin_date, 0)
                relationship_begin_date = datetime(*time_tuple)
            else:
                relationship_begin_date = None

            if sheet.cell_type(row, 4) != 0:
                print('on cell: ' + get_cell_name(row, 4))
                raw_end_date = sheet.cell_value(row, 4)
                time_tuple = xlrd.xldate_as_tuple(raw_end_date, 0)
                relationship_end_date = datetime(*time_tuple)
            else:
                relationship_end_date = None

            if sheet.cell_type(row, 5) != 0:
                notes = sheet.cell_value(row, 5)
            else:
                notes = None

            child = Child.objects.get(person=person)

            new_rel = ChildFamilyRelationship.objects.create(
                child=child,
                family=family,
                ref_child_family_relationship_type=ref_relationship_type,
                relationship_begin_date=relationship_begin_date,
                relationship_end_date=relationship_end_date,
                notes=notes
            )

            print(new_rel)
            print('+++')

    print('child-family relationships complete...')
    return True


def migrate_adult_family_relationships(path, org):
    # path = 'csv/production/demo_schema/'
    # org = Organization.objects.all().first()

    afr_list = []
    for afr in RefAdultFamilyRelationshipType.objects.filter(Q(universal=True) | Q(organization=org)):
        afr_list.append(afr.description)
    afr_specs[2].choice_list = afr_list

    workbook = xlrd.open_workbook(path + "clients.xlsx")

    sheet = workbook.sheet_by_index(1)
    if worksheet_is_valid(sheet, afr_specs):
        print('clients.adult_family_relationships is valid')
    else:
        print('clients.adult_family_relationships is not valid')
        return False

    for row in range(sheet.nrows):
        if row > 0:
            # Get the person record for the row
            old_id = sheet.cell_value(row, 0)
            try:
                person = MigrationPerson.objects.filter(is_child=0).filter(organization=org).get(old_pk=old_id).person
            except MigrationPerson.DoesNotExist:
                print('MigrationPerson record does not exist: ' + get_cell_name(row, 0))
                continue

            # Does this old family record have a new database counterpart yet?
            family_id = sheet.cell_value(row, 1)
            if MigrationFamily.objects.filter(old_family_id=family_id).filter(organization=org).count() > 0:
                # If so, get it:
                family = MigrationFamily.objects.get(Q(old_family_id=family_id) & Q(organization=org)).family
            else:
                # If not, create a new family record:
                family = Family.objects.create()
                print(family, end=' +++ ')
                OrganizationFamilyLink.objects.create(family=family, organization=org)
                # And store the family record in MigrationFamily:
                MigrationFamily.objects.create(family=family, old_family_id=family_id, organization=org)

            ref_relationship_type = None
            if sheet.cell_type(row, 2) != 0:
                try:
                    ref_relationship_type = RefAdultFamilyRelationshipType.objects.get(
                        description=sheet.cell_value(row, 2))
                except RefAdultFamilyRelationshipType.DoesNotExist:
                    print('Relationship type does not exist: ' + get_cell_name(row, 2))
                    ref_relationship_type = None

            if sheet.cell_type(row, 3) != 0:
                raw_begin_date = sheet.cell_value(row, 3)
                time_tuple = xlrd.xldate_as_tuple(raw_begin_date, 0)
                relationship_begin_date = datetime(*time_tuple)
            else:
                relationship_begin_date = None

            if sheet.cell_type(row, 4) != 0:
                print('on cell: ' + get_cell_name(row, 4))
                raw_end_date = sheet.cell_value(row, 4)
                time_tuple = xlrd.xldate_as_tuple(raw_end_date, 0)
                relationship_end_date = datetime(*time_tuple)
            else:
                relationship_end_date = None

            if sheet.cell_type(row, 5) != 0:
                notes = sheet.cell_value(row, 5)
            else:
                notes = None

            primary_adult = False
            if sheet.cell_type(row, 6) != 0:
                if sheet.cell_value(row, 6) == 1:
                    primary_adult = True

            adult = Adult.objects.get(person=person)

            new_rel = AdultFamilyRelationship.objects.create(
                adult=adult,
                family=family,
                ref_adult_family_relationship_type=ref_relationship_type,
                primary_adult=primary_adult,
                relationship_begin_date=relationship_begin_date,
                relationship_end_date=relationship_end_date,
                notes=notes
            )

            print(new_rel)
            print('+++')

    print('adult-family relationships complete...')
    return True


def migrate(path):

    # universal ref_tables
    full_reftable_migration()

    state_list = []
    for s in RefState.objects.filter(Q(universal=True)):
        state_list.append(s.code)
    orglocation_specs[5].choice_list = state_list
    address_specs[5].choice_list = state_list

    county_list = []
    for c in RefCounty.objects.filter(Q(universal=True)):
        county_list.append(c.description)
    orglocation_specs[7].choice_list = county_list
    address_specs[7].choice_list = county_list

    # organization
    workbook = xlrd.open_workbook(path + "organization.xlsx")
    sheet = workbook.sheet_by_index(0)
    if worksheet_is_valid(sheet, organization_specs):
        print('organization.organization is valid...')
    else:
        print('organization.organization is invalid...')
        return

    org_name = sheet.cell_value(1,0)
    org_short_name = sheet.cell_value(1,1)
    org_abbrv = sheet.cell_value(1,2)

    readonly_group = Group.objects.create(name=(org_abbrv + '_readonly'))
    readwrite_group = Group.objects.create(name=(org_abbrv + '_readwrite'))
    admin_group = Group.objects.create(name=(org_abbrv + '_admin'))

    org = Organization.objects.create(name=org_name, short_name=org_short_name, abbreviation=org_abbrv,
                                      read_only_group=readonly_group, read_write_group=readwrite_group,
                                      admin_group=admin_group)
    print(org)

    sheet = workbook.sheet_by_index(1)
    if worksheet_is_valid(sheet, orglocation_specs):
        print('organization.location is valid...')
    else:
        print('organization.location is invalid...')
        return

    for row in range(sheet.nrows):
        if row > 0:
            l_name = sheet.cell_value(row, 0)
            l_short_name = sheet.cell_value(row, 1)
            l_street_number_and_name = sheet.cell_value(row, 2)
            l_apartment_room_or_suite_number = sheet.cell_value(row, 3)
            l_city = sheet.cell_value(row, 4)
            l_state = RefState.objects.get(code=sheet.cell_value(row, 5))
            l_postal_code = sheet.cell_value(row, 6)
            l_county = RefCounty.objects.get(description=sheet.cell_value(row, 7))
            ol = OrganizationLocation.objects.create(organization=org, name=l_name, short_name=l_short_name,
                street_number_and_name=l_street_number_and_name,
                apartment_room_or_suite_number=l_apartment_room_or_suite_number,
                city=l_city, ref_state=l_state, postal_code=l_postal_code, ref_county=l_county)
            print(ol)

    if not migrate_staff(path, org):
        print('an error occurred while migrating staff!')
        return

    if not migrate_clients(path, org):
        print('an error occurred while migrating clients!')
        return

    if not migrate_adult_family_relationships(path, org):
        print('an error occurred while migrating adult-family relationships!')
        return

    if not migrate_child_family_relationships(path, org):
        print('an error occurred while migrating child-family relationships!')
        return

