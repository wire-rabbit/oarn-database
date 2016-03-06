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

from oarndb.models import AdultFamilyRelationship
from oarndb.tests.oarn_factory import OarnFactory


class AdultFamilyRelationshipViewsTestCase(APITestCase):

    def setUp(self):
        self.factory = OarnFactory() # init loads basic data

        self.fbb_family_a = self.factory.new_basic_family(self.factory.fbb)
        self.fbb_family_b = self.factory.new_basic_family(self.factory.fbb)
        self.mtn_family_a = self.factory.new_basic_family(self.factory.mtn)
        self.mtn_family_b = self.factory.new_basic_family(self.factory.mtn)

        # JSON for post tests:

        self.fbb_post_data = {
            "adult": self.factory.new_person(self.factory.fbb).adult.pk,
            "family": self.fbb_family_a.pk,
            "ref_adult_family_relationship_type": self.factory.bio_parent_rel_type.pk,
            "primary_adult": True,
            "relationship_begin_date": "2012-02-14",
            "relationship_end_date": None
        }

        self.mtn_post_data = {
            "adult": self.factory.new_person(self.factory.mtn).adult.pk,
            "family": self.mtn_family_a.pk,
            "ref_adult_family_relationship_type": self.factory.bio_parent_rel_type.pk,
            "primary_adult": True,
            "relationship_begin_date": "2012-02-14",
            "relationship_end_date": None
        }

        # JSON for patch tests:
        self.fbb_patch_data = {
            "adult": self.factory.new_person(self.factory.fbb).adult.pk,
            "family": self.fbb_family_a.pk,
            "ref_adult_family_relationship_type": self.factory.bio_parent_rel_type.pk,
            "primary_adult": False,
            "relationship_end_date": "2013-02-14",
        }

    def test_globalreadonly_can_get_all_relationship_records(self):

        list_url = reverse('adult-family-list')

        response = self.factory.global_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = set()
        for item in response.data['results']:
            ids.add(
                item['adult_family_relationship_id']
            )

        self.assertTrue(len(ids)== 4)

    def test_globaladmin_can_get_all_relationship_records(self):

        list_url = reverse('adult-family-list')

        response = self.factory.global_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = set()
        for item in response.data['results']:
            ids.add(
                item['adult_family_relationship_id']
            )

        self.assertTrue(len(ids)== 4)

    def test_fbb_readonly_can_get_fbb_relationship_records(self):

        list_url = reverse('adult-family-list')

        response = self.factory.fbb_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(AdultFamilyRelationship.objects.filter(family=self.fbb_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertTrue(AdultFamilyRelationship.objects.filter(family=self.fbb_family_b).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(AdultFamilyRelationship.objects.filter(family=self.mtn_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(AdultFamilyRelationship.objects.filter(family=self.mtn_family_b).filter(
            family_id__in=ids).count() > 0)

    def test_fbb_readwrite_can_get_fbb_relationship_records(self):

        list_url = reverse('adult-family-list')

        response = self.factory.fbb_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(AdultFamilyRelationship.objects.filter(family=self.fbb_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertTrue(AdultFamilyRelationship.objects.filter(family=self.fbb_family_b).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(AdultFamilyRelationship.objects.filter(family=self.mtn_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(AdultFamilyRelationship.objects.filter(family=self.mtn_family_b).filter(
            family_id__in=ids).count() > 0)

    def test_fbb_admin_can_get_fbb_relationship_records(self):

        list_url = reverse('adult-family-list')

        response = self.factory.fbb_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(AdultFamilyRelationship.objects.filter(family=self.fbb_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertTrue(AdultFamilyRelationship.objects.filter(family=self.fbb_family_b).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(AdultFamilyRelationship.objects.filter(family=self.mtn_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(AdultFamilyRelationship.objects.filter(family=self.mtn_family_b).filter(
            family_id__in=ids).count() > 0)

    def test_global_readonly_cannot_create_an_fbb_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.global_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_global_admin_can_create_an_fbb_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.global_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_fbb_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readonly_cannot_create_a_mtn_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_fbb_readwrite_can_create_an_fbb_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_fbb_readwrite_cannot_create_a_mtn_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_can_create_an_fbb_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.fbb_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_admin_cannot_create_a_mtn_relationship_record(self):
        create_url = reverse('adult-family-list')

        response = self.factory.fbb_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_global_readonly_cannot_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, has_telephone=True)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.global_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.global_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_admin_can_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_global_readonly_cannot_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.global_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.global_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_admin_can_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_setting_primary_changes_all_related_records(self):

        current_primary = self.fbb_family_a.adultfamilyrelationship_set.filter(primary_adult=True).first()
        cpk = current_primary.pk

        self.assertIsNotNone(current_primary)

        np = self.factory.new_person(self.factory.fbb)
        ld = AdultFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            adult = np.adult,
            ref_adult_family_relationship_type=self.factory.bio_parent_rel_type,
            primary_adult=False
        )
        detail_url = reverse('adult-family-detail', args=[ld.pk])

        patch_data = {
            "adult": np.adult.pk,
            "family": self.fbb_family_a.pk,
            "ref_adult_family_relationship_type": self.factory.bio_parent_rel_type.pk,
            "primary_adult": True,
        }

        response = self.factory.fbb_admin_client.patch(detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertFalse(AdultFamilyRelationship.objects.get(pk=cpk).primary_adult)

        new_primary = self.fbb_family_a.adultfamilyrelationship_set.filter(primary_adult=True).first()

        self.assertFalse(current_primary == new_primary)