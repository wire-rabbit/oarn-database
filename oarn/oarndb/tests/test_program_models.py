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

from oarndb.models import FamilyEnrollment
from oarndb.models import ServiceLevelEnrollment
from oarndb.models import PersonEnrollment
from oarndb.models import CaseManager

from oarndb.models import Family
from oarndb.models import Organization
from oarndb.models import RefProgram
from oarndb.models import RefServiceLevel
from oarndb.models import RefGender
from oarndb.models import Person

import datetime


class ProgramTablesTest(TestCase):
    """
    I want to avoid testing Django framework elements, so I will only test 
    logic that I implement myself. For these tables this primarily means
    that the __str__ method of each model is returning a valid value.
    """

    def setUp(self):
        """
        Create Family, and RefProgram records for the tests
        """
    
        self.family = Family() 
        self.family.save()

        self.fbb = Organization(
            name='Family Building Blocks',
            short_name='FBB',
        )
        self.fbb.save()

        self.outreach = RefProgram(
            description="Outreach",
            code="OR",
            definition="Outreach",
            sort_order=1.0,
            organization=self.fbb
        )
        self.outreach.save()

        self.intensive = RefServiceLevel(
            description="Intensive",
            code="IN",
            definition="Intensive",
            sort_order=1.0,
            ref_program=self.outreach
        )
        self.intensive.save()

        self.female = RefGender(
            description="Female",
            code="F",
            definition="Female",
            sort_order=1.0
        )
        self.female.save()

        self.adult = Person(
            first_name="Wilma",
            middle_name="Neander",
            last_name="Flintstone",
            ref_gender=self.female
        )
        self.adult.save()

    def test_family_enrollment_model(self):
        # FamilyEnrollment:
        fe = FamilyEnrollment.objects.create(
            family=self.family,
            ref_program=self.outreach,
            open_date=datetime.date.today()
        )

        test_str = fe.__str__()
        self.assertIn("Outreach", test_str)

    def test_service_level_enrollment_model(self):
        # ServiceLevelEnrollment:
        fe = FamilyEnrollment.objects.create(
            family=self.family,
            ref_program=self.outreach,
            open_date=datetime.date.today()
        )

        sle = ServiceLevelEnrollment.objects.create(
            ref_service_level=self.intensive,
            family_enrollment=fe,
            open_date=datetime.date.today()
        )
        test_str = sle.__str__()
        self.assertIn("Intensive", test_str)

    def test_person_enrollment_model(self):
        # PersonEnrollment:
        fe = FamilyEnrollment.objects.create(
            family=self.family,
            ref_program=self.outreach,
            open_date=datetime.date.today()
        )

        pe = PersonEnrollment(
            person=self.adult,
            family_enrollment=fe,
            open_date=datetime.date.today()
        )
        test_str = pe.__str__()
        self.assertIn("Wilma", test_str) # is the person present?
        self.assertIn("Outreach", test_str) # is the family enrollment present?

    def test_case_manager_model(self):
        # CaseManager:
        cm = CaseManager.objects.create(
            person=self.adult,
            family=self.family,
            begin_date=datetime.date.today()
        )

        test_str = cm.__str__()
        self.assertIn("Wilma", test_str) # is the case manager present?
        self.assertIn("Family ID", test_str) # is the family present?