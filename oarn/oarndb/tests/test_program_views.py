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

from oarndb.tests.oarn_factory import OarnFactory

class ProgramViewsTestCase(APITestCase):

    def setUp(self):
        self.factory = OarnFactory() # init loads basic data

        self.fbb_family_a = self.factory.new_basic_family(self.factory.fbb)
        self.fbb_family_b = self.factory.new_basic_family(self.factory.fbb)
        self.mtn_family_a = self.factory.new_basic_family(self.factory.mtn)
        self.mtn_family_b = self.factory.new_basic_family(self.factory.mtn)

        self.cm_fbb_family_a = self.factory.new_case_manager(self.fbb_family_a, self.factory.fbb)
        self.cm_fbb_family_b = self.factory.new_case_manager(self.fbb_family_b, self.factory.fbb)
        self.cm_mtn_family_a = self.factory.new_case_manager(self.mtn_family_a, self.factory.mtn)
        self.cm_mtn_family_b = self.factory.new_case_manager(self.mtn_family_b, self.factory.mtn)

        # JSON for post tests:
        self.fbb_post_data = {
            "person_id": self.factory.rand_staff(self.factory.fbb).pk,
            "family_id": self.factory.rand_family(self.factory.fbb).pk,
            "begin_date": self.factory.rand_child_dob(),
            "end_date": None
        }

        self.mtn_post_data = {
            "person_id": self.factory.rand_staff(self.factory.mtn).pk,
            "family_id": self.factory.rand_family(self.factory.mtn).pk,
            "begin_date": self.factory.rand_child_dob(),
            "end_date": self.factory.rand_child_dob()
        }

        # JSON for put tests:
        self.fbb_put_data = {
            "person": self.factory.rand_staff(self.factory.fbb).pk,
            "family": self.factory.rand_family(self.factory.fbb).pk,
            "begin_date": self.factory.rand_child_dob(),
            "end_date": None
        }

        self.mtn_put_data = {
            "person": self.factory.rand_staff(self.factory.mtn).pk,
            "family": self.factory.rand_family(self.factory.mtn).pk,
            "begin_date": self.factory.rand_child_dob(),
            "end_date": self.factory.rand_child_dob()
        }

    def test_global_readonly_can_get_all_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.global_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_fbb_family_b.case_manager_id in cm_ids)
        self.assertTrue(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_mtn_family_b.case_manager_id in cm_ids)

    def test_global_admin_can_get_all_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.global_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_fbb_family_b.case_manager_id in cm_ids)
        self.assertTrue(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_mtn_family_b.case_manager_id in cm_ids)

    def test_fbb_readonly_can_get_fbb_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.fbb_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_fbb_family_b.case_manager_id in cm_ids)
        self.assertFalse(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertFalse(self.cm_mtn_family_b.case_manager_id in cm_ids)

    def test_fbb_readwrite_can_get_fbb_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.fbb_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_fbb_family_b.case_manager_id in cm_ids)
        self.assertFalse(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertFalse(self.cm_mtn_family_b.case_manager_id in cm_ids)

    def test_fbb_admin_can_get_fbb_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.fbb_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_fbb_family_b.case_manager_id in cm_ids)
        self.assertFalse(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertFalse(self.cm_mtn_family_b.case_manager_id in cm_ids)

    def test_mtn_readonly_can_get_mtn_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.mtn_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_mtn_family_b.case_manager_id in cm_ids)
        self.assertFalse(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertFalse(self.cm_fbb_family_b.case_manager_id in cm_ids)

    def test_mtn_readwrite_can_get_mtn_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.mtn_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_mtn_family_b.case_manager_id in cm_ids)
        self.assertFalse(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertFalse(self.cm_fbb_family_b.case_manager_id in cm_ids)

    def test_mtn_admin_can_get_mtn_case_managers(self):
        list_url = reverse('case-managers-list')

        # global readonly user gets back two adults:
        response = self.factory.mtn_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cm_ids = []
        for item in response.data['results']:
            cm_ids.append(
                item['case_manager_id']
            )

        self.assertTrue(self.cm_mtn_family_a.case_manager_id in cm_ids)
        self.assertTrue(self.cm_mtn_family_b.case_manager_id in cm_ids)
        self.assertFalse(self.cm_fbb_family_a.case_manager_id in cm_ids)
        self.assertFalse(self.cm_fbb_family_b.case_manager_id in cm_ids)

    def test_global_readonly_cannot_create_an_fbb_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.global_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_create_an_fbb_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.global_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_global_admin_can_create_an_mtn_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.global_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_fbb_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.fbb_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_create_an_fbb_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.fbb_readwrite_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_admin_can_create_an_fbb_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.fbb_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readwrite_cannot_create_mtn_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.fbb_readwrite_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_cannot_create_mtn_case_manager(self):
        create_url = reverse('case-managers-create')

        response = self.factory.fbb_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_update_fbb_case_manager(self):
        cm = self.factory.rand_case_manager(self.factory.fbb)
        detail_url = reverse('case-managers-detail', args=[cm.pk])

        response = self.factory.global_admin_client.put(
            detail_url, self.fbb_put_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readwrite_can_update_fbb_case_manager(self):
        cm = self.factory.rand_case_manager(self.factory.fbb)
        detail_url = reverse('case-managers-detail', args=[cm.pk])

        response = self.factory.fbb_readwrite_client.put(
            detail_url, self.fbb_put_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readwrite_cannot_update_fbb_case_manager_with_mtn_data(self):
        cm = self.factory.rand_case_manager(self.factory.fbb)
        detail_url = reverse('case-managers-detail', args=[cm.pk])

        response = self.factory.fbb_readwrite_client.put(
            detail_url, self.mtn_put_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_readonly_cannot_delete_fbb_case_manager(self):
        cm = self.factory.rand_case_manager(self.factory.fbb)
        detail_url = reverse('case-managers-detail', args=[cm.pk])

        response = self.factory.global_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_delete_mtn_case_manager(self):
        cm = self.factory.rand_case_manager(self.factory.mtn)
        detail_url = reverse('case-managers-detail', args=[cm.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readonly_cannot_delete_fbb_case_manager(self):
        cm = self.factory.rand_case_manager(self.factory.fbb)
        detail_url = reverse('case-managers-detail', args=[cm.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_delete_fbb_case_manager(self):
        cm = self.factory.rand_case_manager(self.factory.fbb)
        detail_url = reverse('case-managers-detail', args=[cm.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)