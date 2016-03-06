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

from oarndb.models import ChildFamilyRelationship

from oarndb.tests.oarn_factory import OarnFactory


class ChildFamilyRelationshipViewsTestCase(APITestCase):

    def setUp(self):
        self.factory = OarnFactory() # init loads basic data

        self.fbb_family_a = self.factory.new_basic_family(self.factory.fbb)
        self.fbb_family_b = self.factory.new_basic_family(self.factory.fbb)
        self.mtn_family_a = self.factory.new_basic_family(self.factory.mtn)
        self.mtn_family_b = self.factory.new_basic_family(self.factory.mtn)

        # JSON for post tests:

        self.fbb_post_data = {
            "child": self.factory.new_person(self.factory.fbb, is_child=True).child.pk,
            "family": self.fbb_family_a.pk,
            "ref_child_family_relationship_type": self.factory.bio_child_rel_type.pk,
            "relationship_begin_date": "2012-02-14",
            "relationship_end_date": None
        }

        self.mtn_post_data = {
            "child": self.factory.new_person(self.factory.mtn, is_child=True).child.pk,
            "family": self.mtn_family_a.pk,
            "ref_child_family_relationship_type": self.factory.bio_child_rel_type.pk,
            "relationship_begin_date": "2012-02-14",
            "relationship_end_date": None
        }

        # JSON for patch tests:
        self.fbb_patch_data = {
            "child": self.factory.new_person(self.factory.fbb, is_child=True).child.pk,
            "family": self.fbb_family_a.pk,
            "ref_child_family_relationship_type": self.factory.bio_child_rel_type.pk,
            "relationship_end_date": "2013-02-14",
        }

    def test_globalreadonly_can_get_all_relationship_records(self):

        list_url = reverse('child-family-list')

        response = self.factory.global_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = set()
        for item in response.data['results']:
            ids.add(
                item['child_family_relationship_id']
            )

        self.assertTrue(len(ids)== 4)

    def test_globaladmin_can_get_all_relationship_records(self):

        list_url = reverse('child-family-list')

        response = self.factory.global_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = set()
        for item in response.data['results']:
            ids.add(
                item['child_family_relationship_id']
            )

        self.assertTrue(len(ids)== 4)

    def test_fbb_readonly_can_get_fbb_relationship_records(self):

        list_url = reverse('child-family-list')

        response = self.factory.fbb_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(ChildFamilyRelationship.objects.filter(family=self.fbb_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertTrue(ChildFamilyRelationship.objects.filter(family=self.fbb_family_b).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(ChildFamilyRelationship.objects.filter(family=self.mtn_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(ChildFamilyRelationship.objects.filter(family=self.mtn_family_b).filter(
            family_id__in=ids).count() > 0)

    def test_fbb_readwrite_can_get_fbb_relationship_records(self):

        list_url = reverse('child-family-list')

        response = self.factory.fbb_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(ChildFamilyRelationship.objects.filter(family=self.fbb_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertTrue(ChildFamilyRelationship.objects.filter(family=self.fbb_family_b).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(ChildFamilyRelationship.objects.filter(family=self.mtn_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(ChildFamilyRelationship.objects.filter(family=self.mtn_family_b).filter(
            family_id__in=ids).count() > 0)

    def test_fbb_admin_can_get_fbb_relationship_records(self):

        list_url = reverse('child-family-list')

        response = self.factory.fbb_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(ChildFamilyRelationship.objects.filter(family=self.fbb_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertTrue(ChildFamilyRelationship.objects.filter(family=self.fbb_family_b).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(ChildFamilyRelationship.objects.filter(family=self.mtn_family_a).filter(
            family_id__in=ids).count() > 0)

        self.assertFalse(ChildFamilyRelationship.objects.filter(family=self.mtn_family_b).filter(
            family_id__in=ids).count() > 0)

    def test_global_readonly_cannot_create_an_fbb_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.global_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_global_admin_can_create_an_fbb_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.global_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_fbb_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readonly_cannot_create_a_mtn_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_fbb_readwrite_can_create_an_fbb_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_fbb_readwrite_cannot_create_a_mtn_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_can_create_an_fbb_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.fbb_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_admin_cannot_create_a_mtn_relationship_record(self):
        create_url = reverse('child-family-list')

        response = self.factory.fbb_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_global_readonly_cannot_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child=np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.global_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child=np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.global_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_admin_can_update_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, self.fbb_patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_global_readonly_cannot_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.global_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.global_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_admin_can_delete_an_fbb_relationship_record(self):
        np = self.factory.new_person(self.factory.fbb, is_child=True)
        ld = ChildFamilyRelationship.objects.create(
            family=self.fbb_family_a,
            child = np.child,
            ref_child_family_relationship_type=self.factory.bio_child_rel_type
        )
        detail_url = reverse('child-family-detail', args=[ld.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)