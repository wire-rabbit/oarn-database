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

import datetime
import json
from django.test import TestCase
from django.contrib.auth.models import User, Group, Permission

from rest_framework.renderers import JSONRenderer
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

from oarndb.models import Organization

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

from oarndb.serializers import RefAdultChildRelationshipTypeSerializer
from oarndb.serializers import RefLanguageSerializer
from oarndb.serializers import RefLanguageUseTypeSerializer
from oarndb.serializers import RefAdultFamilyRelationshipTypeSerializer
from oarndb.serializers import RefChildFamilyRelationshipTypeSerializer
from oarndb.serializers import RefRaceSerializer
from oarndb.serializers import RefGenderSerializer
from oarndb.serializers import RefPersonTelephoneNumberTypeSerializer
from oarndb.serializers import RefEmailTypeSerializer
from oarndb.serializers import RefCountySerializer
from oarndb.serializers import RefStateSerializer
from oarndb.serializers import RefLocationTypeSerializer
from oarndb.serializers import RefRoleSerializer
from oarndb.serializers import RefContactTypeSerializer
from oarndb.serializers import RefProgramSerializer
from oarndb.serializers import RefServiceLevelSerializer
from oarndb.serializers import RefAssessmentIntervalTypeSerializer
from oarndb.serializers import RefAttendanceStatusSerializer
from oarndb.serializers import RefTransportTypeSerializer
from oarndb.serializers import RefHomeVisitLocationSerializer
from oarndb.serializers import RefReferredFromSerializer

from oarndb.views import AdultChildRelationshipTypesList
from oarndb.views import AdultChildRelationshipTypesDetail

class RefModelsTestCase(TestCase):
    def setUp(self):
        # We need a global admin user to pass all the security checks
        # in the serializer parsing: 
        self.global_admin = Group.objects.create(name='global_admin')
        self.admin_user = User.objects.create_user(
            username='admin_user'
        )
        self.global_admin.user_set.add(self.admin_user)

        # 'code' must be 'XKCD' in both common_data and 
        # common_data_with_program. If you want to change them
        # search-and-replace 'XKCD' in the rest of the file, too.
        self.common_data = {
            'description': 'A description',
            'code': 'XKCD',
            'definition': 'A definition',
            'sort_order': '1.2',
            'universal' : 'True',
            'organization' : None
        }

        self.common_data_with_program = {
            'description': 'Little description',
            'code': 'XKCD',
            'definition': 'A small definition',
            'sort_order': '3.4',
            'universal' : 'False',
            'organization' : Organization.objects.create(
                name='Mountain Star',
                short_name='MTN'
            ).pk,
            'ref_program': RefProgram.objects.create(
                description='TherClassroom',
                code='TC',
                definition='Therapeutic Classrooms',
                sort_order='55',
                universal='True'
            ).pk 
        }

    def generic_serializer_test(
        self, 
        model_type, 
        serializer_type,
        use_program=False        
    ):
        """
        Tests the basic functionality of a serializer.
        """

        # Set up URL and view:
        factory = APIRequestFactory()
        request = factory.get('/api/v1/ref/adult-child-relationship-type/')      
        view = AdultChildRelationshipTypesList.as_view()
        force_authenticate(request, user=self.admin_user)        
        response = view(request)

        if use_program:
            serializer = serializer_type(
                data=self.common_data_with_program, 
                context={'request':request}
            )
        else:
            serializer = serializer_type(
                data=self.common_data,
                context={'request':request}
            )

        # The serializer can parse JSON into valid Python data types
        self.assertTrue(
            serializer.is_valid(),
            serializer.errors
        )

        # The serializer can create an object in the database
        serializer.save()
        count = model_type.objects.filter(code='XKCD').count()
        self.assertTrue(count == 1, 'Saved count is ' + str(count))
                
        # The serializer can update an existing object in the database
        if use_program:
            serializer = serializer_type(
                data=self.common_data_with_program,
                context={'request':request}
            )
            ref = model_type.objects.filter(code='XKCD')[0]
            changed_data = self.common_data_with_program
            changed_data['code'] = 'Monty'
            serializer = serializer_type(
                ref, 
                data=changed_data,
                context={'request':request}            
            )            
        else:
            serializer = serializer_type(
                data=self.common_data,
                context={'request':request}
            )
            ref = model_type.objects.filter(code='XKCD')[0]
            changed_data = self.common_data
            changed_data['code'] = 'Monty'
            serializer = serializer_type(
                ref, 
                data=changed_data,
                context={'request':request}
            )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors
        )
        serializer.save()
        count = model_type.objects.filter(code='Monty').count()
        self.assertTrue(count == 1, 'Modified count is ' + str(count))
        
        # The serializer returns valid JSON
        content = JSONRenderer().render(serializer.data)
        try:
            json.loads(content.decode('utf-8'))
        except ValueError:
            self.fail("Serializer output invalid JSON")

    def test_ref_adult_child_relationship_type_serializer(self):
        """
        Does RefAdultChildRelationshipTypeSerializer provide the basic
        functionality of a serializer?
        """        
        self.generic_serializer_test(
            RefAdultChildRelationshipType,
            RefAdultChildRelationshipTypeSerializer
        )

    def test_ref_language_serializer(self):
        """
        Does RefLanguageSerializer provide the basic functionality of a 
        serializer?
        """
        self.generic_serializer_test(
            RefLanguage,
            RefLanguageSerializer
        )

    def test_ref_language_use_type_serializer(self):
        """
        Does RefLanguageUseTypeSerializer provide the basic functionality
        of a serializer?
        """
        self.generic_serializer_test(
            RefLanguageUseType,
            RefLanguageUseTypeSerializer
        )

    def test_ref_adult_family_relationship_type_serializer(self):
        """
        Does RefAdultFamilyRelationshipTypeSerializer provide the basic 
        functionality of a serializer?
        """
        self.generic_serializer_test(
            RefAdultFamilyRelationshipType,
            RefAdultFamilyRelationshipTypeSerializer
        )

    def test_ref_child_family_relationship_type_serializer(self):
        """
        Does RefChildFamilyRelationshipTypeSerializer provide the basic 
        functionality of a serializer?
        """
        self.generic_serializer_test(
            RefChildFamilyRelationshipType,
            RefChildFamilyRelationshipTypeSerializer
        )

    def test_ref_race_serializer(self):
        """
        Does RefChildFamilyRelationshipTypeSerializer provide the basic 
        functionality of a serializer?
        """
        self.generic_serializer_test(
            RefRace,
            RefRaceSerializer
        )

    def test_ref_gender_serializer(self):
        """
        Does RefGender provide the basic functionality of a serializer?
        """
        self.generic_serializer_test(
            RefGender,
            RefGenderSerializer
        )

    def test_ref_person_telephone_number_type_serializer(self):
        """
        Does RefPersonTelephoneNumberTypeSerializer provide the basic
        functionality of a serializer?
        """
        self.generic_serializer_test(
            RefPersonTelephoneNumberType,
            RefPersonTelephoneNumberTypeSerializer
        )

    def test_ref_email_type_serializer(self):
        """
        Does RefEmailTypeSerializer provide the basic functionality of a 
        serializer?
        """
        self.generic_serializer_test(
            RefEmailType,
            RefEmailTypeSerializer
        )

    def test_ref_county_serializer(self):
        """
        Does RefCountySerializer provide the basic functionality of a 
        serializer?
        """
        self.generic_serializer_test(
            RefCounty,
            RefCountySerializer
        )

    def test_ref_state_serializer(self):
        """
        Does RefStateSerializer provide the basic functionality of a 
        serializer?
        """
        self.generic_serializer_test(
            RefState,
            RefStateSerializer
        )

    def test_ref_location_type_serializer(self):
        """
        Does RefLocationTypeSerializer provide the basic functionality of a 
        serializer?
        """
        self.generic_serializer_test(
            RefLocationType,
            RefLocationTypeSerializer
        )

    def test_ref_role_serializer(self):
        """
        Does RefRole provide the basic functionality of a serializer?
        """
        self.generic_serializer_test(
            RefRole,
            RefRoleSerializer
        )

    def test_ref_contact_type_serializer(self):
        """
        Does RefContactTypeSerializer provide the basic functionality 
        of a serializer?
        """
        self.generic_serializer_test(
            RefContactType,
            RefContactTypeSerializer
        )

    def test_ref_program_serializer(self):
        """
        Does RefProgramSerializer provide the basic functionality 
        of a serializer?
        """
        self.generic_serializer_test(
            RefProgram,
            RefProgramSerializer
        )

    def test_ref_service_level(self):
        """
        Does RefServiceLevelSerializer provide the basic functionality
        of a serializer?
        """
        self.generic_serializer_test(
            RefServiceLevel,
            RefServiceLevelSerializer,
            True
        )

    def test_ref_assessment_interval_type_serializer(self):
        """
        Does RefAssessmentIntervalTypeSerializer provide the basic 
        functionality of a serializer?
        """
        self.generic_serializer_test(
            RefAssessmentIntervalType,
            RefAssessmentIntervalTypeSerializer
        )

    def test_ref_attendance_status_serializer(self):
        """
        Does RefAttendanceStatusSerializer provide the basic functionality
        of a serializer?
        """
        self.generic_serializer_test(
            RefAttendanceStatus,
            RefAttendanceStatusSerializer
        )

    def test_ref_transport_type_serializer(self):
        """
        Does RefTransportTypeSerializer provide the basic functionality
        of a serializer?
        """
        self.generic_serializer_test(
            RefTransportType,
            RefTransportTypeSerializer
        )

    def test_ref_home_visit_location_serializer(self):
        """
        Does RefHomeVisitLocationSerializer provide the better functionality
        of a serializer?
        """
        self.generic_serializer_test(
            RefHomeVisitLocation,
            RefHomeVisitLocationSerializer
        )

    def test_ref_referred_from_serializer(self):
        """ 
        Does RefReferredFromSerializer provide the better functionality
        of a serializer?
        """
        self.generic_serializer_test(
            RefReferredFrom,
            RefReferredFromSerializer
        )
