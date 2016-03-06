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

from django.test import TestCase

from oarndb.models import Organization
from oarndb.models import OrganizationLocation
from oarndb.models import OrganizationPersonRole
from oarndb.models import RefCounty
from oarndb.models import RefState
from oarndb.models import RefGender
from oarndb.models import RefRole
from oarndb.models import Person

import datetime

class OrgTablesTest(TestCase):
    """
    I want to avoid testing Django framework elements, so I will only test 
    logic that I implement myself. For these tables this primarily means
    that the __str__ method of each model is returning a valid value.
    """
    
    def setUp(self):
        """
        Create an organization, state, county, and program to use in the tests.
        """

        self.org = Organization(
            name='Family Building Blocks',
            short_name='FBB',
        )
        self.org.save()

        self.county = RefCounty(
            description="Marion County",
            code="MAR",
            definition="Marion County",
            sort_order=1.0
        )
        self.county.save()

        self.state = RefState(
            description="Oregon",
            code="OR",
            definition="Oregon State",
            sort_order=1.0
        )
        self.state.save()

        self.female = RefGender(
            description="Female",
            code="F",
            definition="Female",
            sort_order=1.0
        )
        self.female.save()

        self.person = Person(
            first_name="Wilma",
            middle_name="Neander",
            last_name="Flintstone",
            ref_gender=self.female
        )
        self.person.save()

        self.staff = RefRole(
            description="Staff",
            code="S",
            definition="Staff",
            sort_order=1.0
        )
        self.staff.save()

    def test_organization_model(self):
        # Organization (created during setup):
        test_str = Organization.objects.filter(
            short_name='FBB'
        )[0].__str__()
        self.assertEqual(test_str, 'FBB')

    def test_organization_location_model(self):
        # OrganizationLocation:
        ol = OrganizationLocation.objects.create(
            name="Chelsea's place",
            organization=self.org,
            short_name="CP",
            street_number_and_name="2425 Lancaster Dr NE",
            city="Salem",
            apartment_room_or_suite_number=None,
            ref_state=self.state,
            postal_code="97305",
            ref_county=self.county
        )
        test_str = ol.__str__()
        self.assertEqual(test_str, 'CP')

    def test_organization_person_role_model(self):
        # OrganizationPersonRole:
        opr = OrganizationPersonRole.objects.create(
            organization=self.org,
            person=self.person,
            ref_role=self.staff,
            entry_date=datetime.date.today()
        )
        test_str = opr.__str__()
        self.assertIn('Flintstone', test_str) # Is the person present?
        self.assertIn('FBB', test_str) # Is the organization present?
        self.assertIn('Staff', test_str) # Is the role present?


    


