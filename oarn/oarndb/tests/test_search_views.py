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
from oarndb.models import Person, Adult, Child, AdultFamilyRelationship, ChildFamilyRelationship, Family
from oarndb.models import RefRole

class SearchViewsTestCase(APITestCase):
    
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

        # set up some test data:
        self.client_role = RefRole.objects.create(description='Client', code='C',
                                                  sort_order='1.0', universal=True)

        self.family_a = Family.objects.create()
        self.family_b = Family.objects.create()

        self.child_a = Person.objects.create(first_name='AChild', last_name='A')
        self.child_b = Person.objects.create(first_name='BChild', last_name='B')
        OrganizationPersonRole.objects.create(person=self.child_a, organization=self.fbb,
                                              ref_role=self.client_role)
        OrganizationPersonRole.objects.create(person=self.child_b, organization=self.mtn,
                                              ref_role=self.client_role)

        Child.objects.create(person=self.child_a)
        Child.objects.create(person=self.child_b)
        ChildFamilyRelationship.objects.create(child=self.child_a.child, family=self.family_a)
        ChildFamilyRelationship.objects.create(child=self.child_b.child, family=self.family_b)

        self.adult_a = Person.objects.create(first_name='AAdult', last_name='A')
        self.adult_b = Person.objects.create(first_name='BAdult', last_name='B')

        OrganizationPersonRole.objects.create(person=self.adult_a, organization=self.fbb,
                                              ref_role=self.client_role)
        OrganizationPersonRole.objects.create(person=self.adult_b, organization=self.mtn,
                                              ref_role=self.client_role)
        Adult.objects.create(person=self.adult_a)
        Adult.objects.create(person=self.adult_b)
        AdultFamilyRelationship.objects.create(adult=self.adult_a.adult, family=self.family_a)
        AdultFamilyRelationship.objects.create(adult=self.adult_b.adult, family=self.family_b)

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
    
    def test_global_readonly_can_get_both_orgs_adults(self):

        adult_list_url = reverse('adult-search-list')

        # global readonly user gets back two adults:
        response = self.global_readonly_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual('B', response.data['results'][1]['last_name'])

    def test_global_admin_can_get_both_orgs_adults(self):

        adult_list_url = reverse('adult-search-list')

        # global admin user gets back two adults:
        response = self.global_admin_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual('B', response.data['results'][1]['last_name'])

    def test_fbb_readonly_can_get_fbb_adults(self):

        adult_list_url = reverse('adult-search-list')

        # fbb readonly user gets back one adult:
        response = self.fbb_readonly_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_fbb_readwrite_can_get_fbb_adults(self):

        adult_list_url = reverse('adult-search-list')

        # fbb readwrite user gets back one adult
        response = self.fbb_readwrite_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_fbb_admin_can_get_fbb_adults(self):

        adult_list_url = reverse('adult-search-list')

        # fbb admin user gets back one adult
        response = self.fbb_readwrite_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_mtn_readonly_can_get_mtn_adults(self):

        adult_list_url = reverse('adult-search-list')

        # fbb readonly user gets back one adult:
        response = self.mtn_readonly_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_mtn_readwrite_can_get_mtn_adults(self):

        adult_list_url = reverse('adult-search-list')

        # fbb readwrite user gets back one adult
        response = self.mtn_readwrite_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_mtn_admin_can_get_mtn_adults(self):

        adult_list_url = reverse('adult-search-list')

        # fbb admin user gets back one adult
        response = self.mtn_readwrite_client.get(adult_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_global_readonly_can_get_both_orgs_children(self):

        child_list_url = reverse('child-search-list')

        # global readonly user gets back two children:
        response = self.global_readonly_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual('B', response.data['results'][1]['last_name'])

    def test_global_admin_can_get_both_orgs_children(self):

        child_list_url = reverse('child-search-list')

        # global admin user gets back two children:
        response = self.global_admin_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual('B', response.data['results'][1]['last_name'])

    def test_fbb_readonly_can_get_fbb_children(self):

        child_list_url = reverse('child-search-list')

        # fbb readonly user gets back one child:
        response = self.fbb_readonly_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_fbb_readwrite_can_get_fbb_children(self):

        child_list_url = reverse('child-search-list')

        # fbb readwrite user gets back one child
        response = self.fbb_readwrite_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_fbb_admin_can_get_fbb_children(self):

        child_list_url = reverse('child-search-list')

        # fbb admin user gets back one child
        response = self.fbb_readwrite_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('A', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_mtn_readonly_can_get_mtn_children(self):

        child_list_url = reverse('child-search-list')

        # fbb readonly user gets back one child:
        response = self.mtn_readonly_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_mtn_readwrite_can_get_mtn_children(self):

        child_list_url = reverse('child-search-list')

        # fbb readwrite user gets back one child
        response = self.mtn_readwrite_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_mtn_admin_can_get_mtn_children(self):

        child_list_url = reverse('child-search-list')

        # fbb admin user gets back one child
        response = self.mtn_readwrite_client.get(child_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_user_can_filter_adult_results_by_first_name(self):
        adult_list_url = reverse('adult-search-list')

        # global admin user gets back two adults:
        response = self.global_admin_client.get(adult_list_url+'?first_name=a', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('AAdult', response.data['results'][0]['first_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_user_can_filter_adult_results_by_last_name(self):
        adult_list_url = reverse('adult-search-list')

        # global admin user gets back two adults:
        response = self.global_admin_client.get(adult_list_url+'?last_name=b', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))
        
    def test_user_can_filter_child_results_by_first_name(self):
        child_list_url = reverse('child-search-list')

        # global admin user gets back two children:
        response = self.global_admin_client.get(child_list_url+'?first_name=a', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('AChild', response.data['results'][0]['first_name'])
        self.assertEqual(1, len(response.data['results']))

    def test_user_can_filter_child_results_by_last_name(self):
        child_list_url = reverse('child-search-list')

        # global admin user gets back two children:
        response = self.global_admin_client.get(child_list_url+'?last_name=b', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('B', response.data['results'][0]['last_name'])
        self.assertEqual(1, len(response.data['results']))