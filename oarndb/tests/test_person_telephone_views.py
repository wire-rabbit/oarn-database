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

import sys

from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User, Group
from django.core.urlresolvers import reverse

from oarndb.models import PersonTelephone

from oarndb.tests.oarn_factory import OarnFactory


class PersonTelephoneViewsTestCase(APITestCase):

    def setUp(self):
        self.factory = OarnFactory() # init loads basic data

        self.fbb_family_a = self.factory.new_basic_family(self.factory.fbb)
        self.fbb_family_b = self.factory.new_basic_family(self.factory.fbb)
        self.mtn_family_a = self.factory.new_basic_family(self.factory.mtn)
        self.mtn_family_b = self.factory.new_basic_family(self.factory.mtn)

        # JSON for post tests:

        self.fbb_post_data = {
            "person": self.factory.new_person(self.factory.fbb, has_telephone=False).pk,
            "telephone_number": "123-456-7890",
            "ref_person_telephone_number_type": self.factory.telephone_type.pk
        }

        self.mtn_post_data = {
            "person": self.factory.new_person(self.factory.mtn, has_telephone=False).pk,
            "telephone_number": "123-456-7890",
            "ref_person_telephone_number_type": self.factory.telephone_type.pk
        }

        # JSON for patch tests:
        self.fbb_patch_data = {
            "person": self.factory.new_person(self.factory.fbb, has_telephone=False).pk,
            "telephone_number": "503-456-7890"
        }

    def test_globalreadonly_can_get_all_telephone_records(self):
        list_url = reverse('telephone-list')

        response = self.factory.global_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['person']
            )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )
    
    def test_globaladmin_can_get_all_telephone_records(self):
        """
        The basic family created by the factory consists of one adult and one child.
        Do we get 8 records back?

        :return:
        """
        list_url = reverse('telephone-list')

        response = self.factory.global_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['person']
            )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

    def test_fbb_readonly_can_get_fbb_telephone_records(self):
        """
        The basic family created by the factory consists of one adult and one child.
        Do we get 4 records back?

        :return:
        """
        list_url = reverse('telephone-list')

        response = self.factory.fbb_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['person']
            )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

    def test_fbb_readwrite_can_get_fbb_telephone_records(self):
        """
        The basic family created by the factory consists of one adult and one child.
        Do we get 4 records back?

        :return:
        """
        list_url = reverse('telephone-list')

        response = self.factory.fbb_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['person']
            )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

    def test_fbb_admin_can_get_fbb_telephone_records(self):
        """
        The basic family created by the factory consists of one adult and one child.
        Do we get 4 records back?

        :return:
        """
        list_url = reverse('telephone-list')

        response = self.factory.fbb_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['person']
            )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_a).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertTrue(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.fbb_family_b).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_a).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__adult__adultfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )

        self.assertFalse(PersonTelephone.objects.filter(
            person__child__childfamilyrelationship__family=self.mtn_family_b).filter(
            person_id__in=ids)
        )
        
    def test_global_readonly_cannot_create_an_fbb_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.global_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_create_an_fbb_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.global_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_fbb_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readonly_cannot_create_a_mtn_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_fbb_readwrite_can_create_an_fbb_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_fbb_readwrite_cannot_create_a_mtn_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_can_create_an_fbb_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.fbb_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_admin_cannot_create_a_mtn_telephone_record(self):
        create_url = reverse('telephone-list')

        response = self.factory.fbb_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_readonly_cannot_update_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.global_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_update_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.global_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_update_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_admin_can_update_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_global_readonly_cannot_delete_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.global_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_delete_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.global_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_delete_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_admin_can_delete_an_fbb_telephone_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = np.persontelephone_set.all().first()
        detail_url = reverse('telephone-detail', args=[ld.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)