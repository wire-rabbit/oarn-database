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

from oarndb.models import FamilyAddress

from oarndb.tests.oarn_factory import OarnFactory

class FamilyAddressViewsTestCase(APITestCase):

    def setUp(self):
        self.factory = OarnFactory() # init loads basic data

        self.fbb_family_a = self.factory.new_basic_family(self.factory.fbb)
        self.fbb_family_b = self.factory.new_basic_family(self.factory.fbb)
        self.mtn_family_a = self.factory.new_basic_family(self.factory.mtn)
        self.mtn_family_b = self.factory.new_basic_family(self.factory.mtn)

        # JSON for post tests:

        self.fbb_post_data = {
            "family": self.factory.rand_family(self.factory.fbb).pk,
            "ref_location_type": self.factory.location_type_home.pk,
            "street_number_and_name": "123 Any St.",
            "apartment_room_or_suite_number": "#2B",
            "city": "Salem",
            "ref_state": self.factory.state_or.pk,
            "postal_code": "97302",
            "ref_county": self.factory.county_marion.pk,
            "residence_end_date": None,
            "primary_address": False,
            "notes": "Secondary residence"
        }

        self.mtn_post_data = {
            "family": self.factory.rand_family(self.factory.mtn).pk,
            "ref_location_type": self.factory.location_type_home.pk,
            "street_number_and_name": "456 Other Ave.",
            "apartment_room_or_suite_number": "#3C",
            "city": "Salem",
            "ref_state": self.factory.state_or.pk,
            "postal_code": "97303",
            "ref_county": self.factory.county_marion.pk,
            "residence_end_date": None,
            "primary_address": False,
            "notes": "Alternate residence"
        }

        # JSON for patch tests:
        self.fbb_patch_data = {
            "family": self.factory.rand_family(self.factory.fbb).pk,
            "notes": "updated!"
        }
        
        self.mtn_patch_data = {
            "family": self.factory.rand_family(self.factory.mtn).pk,
            "notes": "updated!"
        }

    def test_globalreadonly_can_get_all_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.global_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))

    def test_globaladmin_can_get_all_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.global_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))

    def test_fbb_readonly_can_get_fbb_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.fbb_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))

    def test_fbb_readwrite_can_get_fbb_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.fbb_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))

    def test_fbb_admin_can_get_fbb_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.fbb_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))

    def test_mtn_readonly_can_get_mtn_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.mtn_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))

    def test_mtn_readwrite_can_get_mtn_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.mtn_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))

    def test_mtn_admin_can_get_mtn_addresses(self):
        list_url = reverse('addresses-list')

        response = self.factory.mtn_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ad_ids = []
        for item in response.data['results']:
            ad_ids.append(
                item['family_address_id']
            )

        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertTrue(FamilyAddress.objects.filter(family=self.mtn_family_b).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.fbb_family_a).filter(
            pk__in=ad_ids
        ))
        self.assertFalse(FamilyAddress.objects.filter(family=self.fbb_family_b).filter(
            pk__in=ad_ids
        ))

    def test_global_readonly_cannot_create_an_fbb_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.global_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_readonly_cannot_create_a_mtn_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.global_readonly_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_create_an_fbb_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.global_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_global_admin_can_create_a_mtn_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.global_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_fbb_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.fbb_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readonly_cannot_create_a_mtn_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.global_readonly_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_create_an_fbb_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.fbb_readwrite_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readwrite_cannot_create_a_mtn_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.fbb_readwrite_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_can_create_an_fbb_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.fbb_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_admin_cannot_create_a_mtn_address(self):
        create_url = reverse('addresses-create')

        response = self.factory.fbb_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_readonly_cannot_update_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.global_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_update_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.global_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_update_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_admin_can_update_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_global_readonly_cannot_delete_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.global_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_delete_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.global_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_delete_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_admin_can_delete_an_fbb_address(self):
        addr = self.factory.rand_address(self.factory.fbb)
        detail_url = reverse('addresses-detail', args=[addr.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)