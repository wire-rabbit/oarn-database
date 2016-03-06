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

from oarndb.models import RefAdultChildRelationshipType
from oarndb.models import RefLanguage
from oarndb.models import RefLanguageUseType
from oarndb.models import RefAdultFamilyRelationshipType
from oarndb.models import RefChildFamilyRelationshipType
from oarndb.models import RefRace
from oarndb.models import RefGender
from oarndb.models import RefPersonTelephoneNumberType
from oarndb.models import RefEmailType
from oarndb.models import RefCounty
from oarndb.models import RefState
from oarndb.models import RefLocationType
from oarndb.models import RefRole
from oarndb.models import RefContactType
from oarndb.models import RefProgram
from oarndb.models import RefServiceLevel
from oarndb.models import RefAssessmentIntervalType
from oarndb.models import RefAttendanceStatus
from oarndb.models import RefTransportType
from oarndb.models import RefHomeVisitLocation
from oarndb.models import RefReferredFrom

from oarndb.models import Organization


class ReferenceTablesTest(TestCase):
    """
    The reference tables are fairly simple, and I want to avoid testing Django framework elements,
    so I will only test logic that I implement myself. For these tables this primarily means that
    the __str__ method of each model is returning a valid value.
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

        self.program = RefProgram(
            description='Therapeutic Classroom',
            code='TC',
            definition='Therapeutic classroom services',
            sort_order = 1.0,
            organization=self.org
        )
        self.program.save()

    def test_reference_tables_str_method(self):
        """
        Does each reference table contain a valid __str__ method?
        """
        # RefAdultChildRelationshipType:
        new_record = RefAdultChildRelationshipType(
            description='Biological Mother',
            code='BM',
            definition='Biological Parent',
            sort_order = 1.0
        )
        new_record.save()
        test_str = RefAdultChildRelationshipType.objects.filter(
            description='Biological Mother'
        )[0].__str__()
        self.assertEqual(test_str, 'Biological Mother')

        # RefLanguage:
        new_record = RefLanguage(
            description='Spanish',
            code='SP',
            definition='Spanish',
            sort_order = 1.0
        )
        new_record.save()
        test_str = RefLanguage.objects.filter(
            description='Spanish'
        )[0].__str__()
        self.assertEqual(test_str, 'Spanish')

        # RefLanguageUseType:
        new_record = RefLanguageUseType(
            description='Home',
            code='HM',
            definition='Language used at home',
            sort_order = 1.0
        )
        new_record.save()
        test_str = RefLanguageUseType.objects.filter(
            description='Home'
        )[0].__str__()
        self.assertEqual(test_str, 'Home')
        
        # RefAdultFamilyRelationshipType:
        new_record = RefAdultFamilyRelationshipType(
            description='Uncle',
            code='UN',
            definition="Biological Parent's Brother",
            sort_order = 3.0
        )
        new_record.save()
        test_str = RefAdultFamilyRelationshipType.objects.filter(
            description='Uncle'
        )[0].__str__()
        self.assertEqual(test_str, 'Uncle')

        # RefChildFamilyRelationshipType:
        new_record = RefChildFamilyRelationshipType(
            description='Foster Child',
            code='FC',
            definition="A child in foster care",
            sort_order = 2.9
        )
        new_record.save()
        test_str = RefChildFamilyRelationshipType.objects.filter(
            description='Foster Child'
        )[0].__str__()
        self.assertEqual(test_str, 'Foster Child')

        # RefRace:
        new_record = RefRace(
            description='Native American',
            code='NA',
            definition="Native American",
            sort_order = 1.5
        )
        new_record.save()
        test_str = RefRace.objects.filter(
            description='Native American'
        )[0].__str__()
        self.assertEqual(test_str, 'Native American')

        # RefGender:
        new_record = RefGender(
            description='Male',
            code='M',
            definition="Male",
            sort_order = 3.3
        )
        new_record.save()
        test_str = RefGender.objects.filter(
            description='Male'
        )[0].__str__()
        self.assertEqual(test_str, 'Male')

        # RefPersonTelephoneNumberType:
        new_record = RefPersonTelephoneNumberType(
            description='Cell',
            code='C',
            definition="Cell phone",
            sort_order = 5.0
        )
        new_record.save()
        test_str = RefPersonTelephoneNumberType.objects.filter(
            description='Cell'
        )[0].__str__()
        self.assertEqual(test_str, 'Cell')

        # RefEmailType:
        new_record = RefEmailType(
            description='Work',
            code='W',
            definition="Work email",
            sort_order = 3.2
        )
        new_record.save()
        test_str = RefEmailType.objects.filter(
            description='Work'
        )[0].__str__()
        self.assertEqual(test_str, 'Work')
        
        # RefCounty:
        new_record = RefCounty(
            description='Marion',
            code='MA',
            definition="Marion County",
            sort_order = 9.4
        )
        new_record.save()
        test_str = RefCounty.objects.filter(
            description='Marion'
        )[0].__str__()
        self.assertEqual(test_str, 'Marion')

        # RefState:
        new_record = RefState(
            description='Oregon',
            code='OR',
            definition="Oregon",
            sort_order = 1.0
        )
        new_record.save()
        test_str = RefState.objects.filter(
            description='Oregon'
        )[0].__str__()
        self.assertEqual(test_str, 'Oregon')

        # RefLocationType:
        new_record = RefLocationType(
            description='Apartment',
            code='AP',
            definition="Rented Dwelling",
            sort_order = 1.0
        )
        new_record.save()
        test_str = RefLocationType.objects.filter(
            description='Apartment'
        )[0].__str__()
        self.assertEqual(test_str, 'Apartment')

        # RefRole:
        new_record = RefRole(
            description='Employee',
            code='EM',
            definition="Staff",
            sort_order = 1.0
        )
        new_record.save()
        test_str = RefRole.objects.filter(
            description='Employee'
        )[0].__str__()
        self.assertEqual(test_str, 'Employee')

        # RefContactType:
        new_record = RefContactType(
            description='Phone',
            code='PH',
            definition="Telephone contact",
            sort_order = 1.0
        )
        new_record.save()
        test_str = RefContactType.objects.filter(
            description='Phone'
        )[0].__str__()
        self.assertEqual(test_str, 'Phone')

        # RefProgram:
        test_str = RefProgram.objects.filter(
            description='Therapeutic Classroom'
        )[0].__str__()
        self.assertEqual(test_str, 'Therapeutic Classroom')

        # RefServiceLevel:
        new_record = RefServiceLevel(
            description='Intensive',
            code='IN',
            definition='Intensive Services',
            sort_order = 1.0,
            ref_program=self.program
        )
        new_record.save()
        test_str = RefServiceLevel.objects.filter(
            description='Intensive'
        )[0].__str__()
        self.assertEqual(test_str, 'Intensive')

        # RefAssessmentIntervalType:
        new_record = RefAssessmentIntervalType(
            description='Intake',
            code='IN',
            definition='Intake',
            sort_order = 1.0,
            organization=self.org,
        )
        new_record.save()
        test_str = RefAssessmentIntervalType.objects.filter(
            description='Intake'
        )[0].__str__()
        self.assertEqual(test_str, 'Intake')

        # RefAttendanceStatus
        new_record = RefAttendanceStatus(
            description='Attended',
            code='A',
            definition='Attended class',
            sort_order = 1.0,
            organization=self.org,
        )
        new_record.save()
        test_str = RefAttendanceStatus.objects.filter(
            description='Attended'
        )[0].__str__()
        self.assertEqual(test_str, 'Attended')

        # RefTransportType:
        new_record = RefTransportType(
            description='Bus',
            code='B',
            definition='Transported by Bus',
            sort_order = 1.0,
            organization=self.org,
        )
        new_record.save()
        test_str = RefTransportType.objects.filter(
            description='Bus'
        )[0].__str__()
        self.assertEqual(test_str, 'Bus')

        # RefHomeVisitLocation:
        new_record = RefHomeVisitLocation(
            description='Home',
            code='H',
            definition='Visit occurred in the home',
            sort_order = 1.0,
            organization=self.org,
        )
        new_record.save()
        test_str = RefHomeVisitLocation.objects.filter(
            description='Home'
        )[0].__str__()
        self.assertEqual(test_str, 'Home')

        # RefReferredFrom:
        new_record = RefReferredFrom(
            description='Medical Provider',
            code='MP',
            definition='Parent was referred by medical provider',
            sort_order = 1.0,
            organization=self.org,
        )
        new_record.save()
        test_str = RefReferredFrom.objects.filter(
            description='Medical Provider'
        )[0].__str__()
        self.assertEqual(test_str, 'Medical Provider')


