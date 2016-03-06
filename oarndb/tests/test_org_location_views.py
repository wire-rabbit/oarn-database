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
from django.core.urlresolvers import reverse

from oarndb.models import Organization, OrganizationLocation

from oarndb.tests.oarn_factory import OarnFactory

class OrganizationLocationTestCase(APITestCase):

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
            "organization": self.factory.fbb.pk,
            "name": "Site Alpha",
            "short_name": "Alpha",
            "street_number_and_name": "123 Any Ave",
            "apartment_room_or_suite_number": "Ste 2B",
            "city": "Salem",
            "ref_state": self.factory.state_or.pk,
            "postal_code": "97305",
            "ref_county": self.factory.county_marion.pk
        }

        self.mtn_post_data = {
            "organization": self.factory.mtn.pk,
            "name": "Site Beta",
            "short_name": "Beta",
            "street_number_and_name": "888 Any Ave",
            "apartment_room_or_suite_number": "Ste 3C",
            "city": "Salem",
            "ref_state": self.factory.state_or.pk,
            "postal_code": "97305",
            "ref_county": self.factory.county_marion.pk
        }

        # JSON for patch tests:
        self.fbb_patch_data = {
            "organization": self.factory.fbb.pk,
            "name": "Site Zeta",
            "short_name": "Zeta",
        }

        self.mtn_patch_data = {
            "organization": self.factory.mtn.pk,
            "name": "Site Kappa",
            "short_name": "Kappa",
        }

    def test_globalreadonly_can_get_all_records(self):

            list_url = reverse('org-location-list')

            response = self.factory.global_readonly_client.get(list_url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            ids = []
            for item in response.data['results']:
                ids.append(
                    item['organization_location_id']
                )

            self.assertIn(self.factory.fbb_site.organization_location_id, ids)
            self.assertIn(self.factory.mtn_site.organization_location_id, ids)

    def test_globaladmin_can_get_all_records(self):

            list_url = reverse('org-location-list')

            response = self.factory.global_admin_client.get(list_url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            ids = []
            for item in response.data['results']:
                ids.append(
                    item['organization_location_id']
                )

            self.assertIn(self.factory.fbb_site.organization_location_id, ids)
            self.assertIn(self.factory.mtn_site.organization_location_id, ids)

    def test_fbbreadonly_can_get_fbb_records(self):

            list_url = reverse('org-location-list')

            response = self.factory.fbb_readonly_client.get(list_url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            ids = []
            for item in response.data['results']:
                ids.append(
                    item['organization_location_id']
                )

            self.assertIn(self.factory.fbb_site.organization_location_id, ids)
            self.assertNotIn(self.factory.mtn_site.organization_location_id, ids)

    def test_fbbreadwrite_can_get_fbb_records(self):

            list_url = reverse('org-location-list')

            response = self.factory.fbb_readwrite_client.get(list_url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            ids = []
            for item in response.data['results']:
                ids.append(
                    item['organization_location_id']
                )

            self.assertIn(self.factory.fbb_site.organization_location_id, ids)
            self.assertNotIn(self.factory.mtn_site.organization_location_id, ids)

    def test_fbbadmin_can_get_fbb_records(self):

            list_url = reverse('org-location-list')

            response = self.factory.fbb_admin_client.get(list_url, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            ids = []
            for item in response.data['results']:
                ids.append(
                    item['organization_location_id']
                )

            self.assertIn(self.factory.fbb_site.organization_location_id, ids)
            self.assertNotIn(self.factory.mtn_site.organization_location_id, ids)

    def test_global_readonly_cannot_create_an_fbb_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.global_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_create_an_fbb_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.global_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_fbb_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_create_an_fbb_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_can_create_an_fbb_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.fbb_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_mtn_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_create_an_mtn_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_cannot_create_an_mtn_record(self):
        create_url = reverse('org-location-list')

        response = self.factory.fbb_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_readonly_cannot_update_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.global_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_update_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.global_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_update_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_can_update_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_mtn_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.mtn_site.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_fbb_readwrite_cannot_update_an_mtn_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.mtn_site.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_fbb_admin_cannot_update_an_mtn_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.mtn_site.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_global_readonly_cannot_delete_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.global_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_delete_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.global_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_delete_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_can_delete_an_fbb_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.fbb_site.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_mtn_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.mtn_site.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_delete_an_mtn_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.mtn_site.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_cannot_delete_an_mtn_record(self):
        detail_url = reverse('org-location-detail', args=[self.factory.mtn_site.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)