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

from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User, Group
from django.core.urlresolvers import reverse

from oarndb.models import Organization, OrganizationPersonRole
from oarndb.models import Family, Person, AdultFamilyRelationship, ChildFamilyRelationship
from oarndb.models import OrganizationFamilyLink, Adult, Child
from oarndb.models import RefAdultFamilyRelationshipType, RefChildFamilyRelationshipType, RefRole

class FamilyViewTestCase(APITestCase):
    
    def setUp(self):
        # set up security groups:
        self.global_admin = Group.objects.create(name='global_admin')
        self.global_readonly = Group.objects.create(name='global_readonly')
        self.fbb_readonly = Group.objects.create(name='fbb_readonly')
        self.fbb_readwrite = Group.objects.create(name='fbb_readwrite')
        self.fbb_admin = Group.objects.create(name='fbb_admin')
        self.mtn_readonly = Group.objects.create(name='mtn_readonly')
        self.mtn_readwrite = Group.objects.create(name='mtn_readwrite')
        self.mtn_admin = Group.objects.create(name='mtn_admin')

        # set up two orgs, FBB and MTN:
        self.fbb = Organization.objects.create(name='FBB', short_name='fbb',
                                               read_only_group=self.fbb_readonly,
                                               read_write_group=self.fbb_readwrite,
                                               admin_group=self.fbb_admin)

        self.mtn = Organization.objects.create(name='MTN', short_name='mtn',
                                               read_only_group=self.mtn_readonly,
                                               read_write_group=self.mtn_readwrite,
                                               admin_group=self.mtn_admin)

        # set up users:
        self.global_admin_user = User.objects.create(username='global_admin_user')
        self.global_admin.user_set.add(self.global_admin_user)

        self.global_readonly_user = User.objects.create(username='global_readonly_user')
        self.global_readonly.user_set.add(self.global_readonly_user)

        self.fbb_readonly_user = User.objects.create(username='fbb_readonly_user')
        self.fbb_readonly.user_set.add(self.fbb_readonly_user)

        self.fbb_readwrite_user = User.objects.create(username='fbb_readwrite_user')
        self.fbb_readwrite.user_set.add(self.fbb_readwrite_user)

        self.fbb_admin_user = User.objects.create(username='fbb_admin_user')
        self.fbb_admin.user_set.add(self.fbb_admin_user)

        self.mtn_readonly_user = User.objects.create(username='mtn_readonly_user')
        self.mtn_readonly.user_set.add(self.mtn_readonly_user)

        self.mtn_readwrite_user = User.objects.create(username='mtn_readwrite_user')
        self.mtn_readwrite.user_set.add(self.mtn_readwrite_user)

        self.mtn_admin_user = User.objects.create(username='mtn_admin_user')
        self.mtn_admin.user_set.add(self.mtn_admin_user)

        # set up clients:
        self.global_readonly_client = APIClient()
        self.global_readonly_client.force_authenticate(user=self.global_readonly_user)

        self.global_admin_client = APIClient()
        self.global_admin_client.force_authenticate(user=self.global_admin_user)

        self.fbb_readonly_client = APIClient()
        self.fbb_readonly_client.force_authenticate(user=self.fbb_readonly_user)

        self.fbb_readwrite_client = APIClient()
        self.fbb_readwrite_client.force_authenticate(user=self.fbb_readwrite_user)

        self.fbb_admin_client = APIClient()
        self.fbb_admin_client.force_authenticate(user=self.fbb_admin_user)

        self.mtn_readonly_client = APIClient()
        self.mtn_readonly_client.force_authenticate(user=self.mtn_readonly_user)

        self.mtn_readwrite_client = APIClient()
        self.mtn_readwrite_client.force_authenticate(user=self.mtn_readwrite_user)

        self.mtn_admin_client = APIClient()
        self.mtn_admin_client.force_authenticate(user=self.mtn_admin_user)

        # set up some test data:
        # we need a couple of relationship-to-family types:
        self.adult_family_relationship_type = RefAdultFamilyRelationshipType.objects.create(
            description='Type 1',
            code='T1',
            sort_order=1.0,
            universal=True
        )
        
        self.child_family_relationship_type = RefChildFamilyRelationshipType.objects.create(
            description='Type 2',
            code='T2',
            sort_order=2.0,
            universal=True
        )
        
        # we need a client type:
        self.client_role = RefRole.objects.create(
            description='Client',
            code='C',
            sort_order=1.0,
            universal=True
        )
        
        # we need a plain vanilla family for each organization, each with one adult and one child:
        self.family_vanilla_fbb = Family.objects.create()
        
        OrganizationFamilyLink.objects.create(family=self.family_vanilla_fbb, organization=self.fbb)
        
        self.adult_vanilla_fbb = Person.objects.create(
            first_name='John',
            last_name='Smith'
        )

        OrganizationPersonRole.objects.create(
            person=self.adult_vanilla_fbb,
            organization=self.fbb,
            ref_role=self.client_role
        )

        fbb_adult = Adult.objects.create(person=self.adult_vanilla_fbb)
        
        AdultFamilyRelationship.objects.create(
            family=self.family_vanilla_fbb,
            adult=fbb_adult,
            primary_adult=True,
            ref_adult_family_relationship_type=self.adult_family_relationship_type
        )
        
        self.child_vanilla_fbb = Person.objects.create(
            first_name='Mary',
            last_name='Smith'
        )
        
        OrganizationPersonRole.objects.create(
            person=self.child_vanilla_fbb,
            organization=self.fbb,
            ref_role=self.client_role
        )
        
        fbb_child = Child.objects.create(person=self.child_vanilla_fbb)
        
        ChildFamilyRelationship.objects.create(
            family=self.family_vanilla_fbb,
            child=fbb_child,
            ref_child_family_relationship_type=self.child_family_relationship_type
        )
        
        self.family_vanilla_mtn = Family.objects.create()

        OrganizationFamilyLink.objects.create(family=self.family_vanilla_mtn, organization=self.mtn)
        
        self.adult_vanilla_mtn = Person.objects.create(
            first_name='John',
            last_name='Smith'
        )

        OrganizationPersonRole.objects.create(
            person=self.adult_vanilla_mtn,
            organization=self.mtn,
            ref_role=self.client_role
        )

        mtn_adult = Adult.objects.create(person=self.adult_vanilla_mtn)
        
        AdultFamilyRelationship.objects.create(
            family=self.family_vanilla_mtn,
            adult=mtn_adult,
            primary_adult=True,
            ref_adult_family_relationship_type=self.adult_family_relationship_type
        )
        
        self.child_vanilla_mtn = Person.objects.create(
            first_name='Mary',
            last_name='Smith'
        )
        
        OrganizationPersonRole.objects.create(
            person=self.child_vanilla_mtn,
            organization=self.mtn,
            ref_role=self.client_role
        )
        
        mtn_child = Child.objects.create(person=self.child_vanilla_mtn)
        
        ChildFamilyRelationship.objects.create(
            family=self.family_vanilla_mtn,
            child=mtn_child,
            ref_child_family_relationship_type=self.child_family_relationship_type
        )

        # And we need some POST data for creating new families:

        adult_role_id = self.adult_family_relationship_type.ref_adult_family_relationship_type_id
        child_role_id = self.child_family_relationship_type.ref_child_family_relationship_type_id

        self.post_data = {
            "notes": "Foo Notes",
            "organizations": [
                {"organization_id":self.mtn.organization_id}
            ],
            "adults": [
                {"person_id": self.adult_vanilla_mtn.person_id,
                 "primary_adult": True,
                 "ref_adult_family_relationship_type": adult_role_id,
                 "relationship_begin_date": None,
                 "relationship_end_date": None
                }
            ],
            "children": [
                {"person_id": self.child_vanilla_mtn.person_id,
                 "ref_child_family_relationship_type": child_role_id,
                 "relationship_begin_date": None,
                 "relationship_end_date": None
                }
            ]
        }

    def test_global_readonly_can_get_both_families(self):
        family_list_url = reverse('family-list')

        # global readonly user gets back two adults:
        response = self.global_readonly_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_fbb.person_id in adult_ids)
        self.assertTrue(self.adult_vanilla_mtn.person_id in adult_ids)

    def test_global_admin_can_get_both_orgs_families(self):
        family_list_url = reverse('family-list')

        # global admin user gets back two adults:
        response = self.global_admin_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_fbb.person_id in adult_ids)
        self.assertTrue(self.adult_vanilla_mtn.person_id in adult_ids)

    def test_fbb_readonly_can_get_fbb_families(self):
        family_list_url = reverse('family-list')

        # fbb readonly user gets back one adult:
        response = self.fbb_readonly_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_fbb.person_id in adult_ids)
        self.assertFalse(self.adult_vanilla_mtn.person_id in adult_ids)

    def test_fbb_readwrite_can_get_fbb_families(self):
        family_list_url = reverse('family-list')

        # fbb read-write user gets back one adult:
        response = self.fbb_readwrite_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_fbb.person_id in adult_ids)
        self.assertFalse(self.adult_vanilla_mtn.person_id in adult_ids)

    def test_fbb_admin_can_get_fbb_families(self):
        family_list_url = reverse('family-list')

        # fbb admin user gets back one adult:
        response = self.fbb_admin_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_fbb.person_id in adult_ids)
        self.assertFalse(self.adult_vanilla_mtn.person_id in adult_ids)
        
    def test_mtn_readonly_can_get_mtn_families(self):
        family_list_url = reverse('family-list')

        # mtn readonly user gets back one adult:
        response = self.mtn_readonly_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_mtn.person_id in adult_ids)
        self.assertFalse(self.adult_vanilla_fbb.person_id in adult_ids)

    def test_mtn_readwrite_can_get_mtn_families(self):
        family_list_url = reverse('family-list')

        # mtn read-write user gets back one adult:
        response = self.mtn_readwrite_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_mtn.person_id in adult_ids)
        self.assertFalse(self.adult_vanilla_fbb.person_id in adult_ids)

    def test_mtn_admin_can_get_mtn_families(self):
        family_list_url = reverse('family-list')

        # mtn admin user gets back one adult:
        response = self.mtn_admin_client.get(family_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        adult_ids = []
        for item in response.data['results']:
            adult_ids.append(
                item['adultfamilyrelationship_set'][0]['adult']['person']['person_id']
            )

        self.assertTrue(self.adult_vanilla_mtn.person_id in adult_ids)
        self.assertFalse(self.adult_vanilla_fbb.person_id in adult_ids)

    def test_fbb_readonly_cannot_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.fbb_readonly_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.fbb_readwrite_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_cannot_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.fbb_admin_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mtn_readonly_cannot_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.mtn_readonly_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mtn_readwrite_can_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.mtn_readwrite_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_mtn_admin_can_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.mtn_admin_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_global_readonly_cannot_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.global_readonly_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_create_a_mtn_family(self):
        family_create_url = reverse('family-create')

        response = self.global_admin_client.post(family_create_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)