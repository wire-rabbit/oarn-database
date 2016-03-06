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

from oarndb.models import FamilyAssessment, RefAssessmentInterval

from oarndb.tests.oarn_factory import OarnFactory

class FamilyAssessmentViewsTestCase(APITestCase):

    def setUp(self):
        self.factory = OarnFactory() # init loads basic data

        self.fbb_family_a = self.factory.new_basic_family(self.factory.fbb)
        self.fbb_family_b = self.factory.new_basic_family(self.factory.fbb)
        self.mtn_family_a = self.factory.new_basic_family(self.factory.mtn)
        self.mtn_family_b = self.factory.new_basic_family(self.factory.mtn)

        self.fbb_staff = self.factory.new_person(self.factory.fbb, is_client=False)
        self.mtn_staff = self.factory.new_person(self.factory.mtn, is_client=False)

        self.interval = RefAssessmentInterval.objects.create(
            description='Interval', code='I', sort_order=1.0, universal=True
        )

        # JSON for post tests:
        self.fbb_post_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2014-04-26',
            "family": self.factory.new_basic_family(self.factory.fbb).pk,
            "employee": self.factory.rand_staff(self.factory.fbb).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.factory.rand_family(self.factory.fbb)).adult.pk
        }

        self.mtn_post_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2014-04-26',
            "family": self.factory.new_basic_family(self.factory.mtn).pk,
            "employee": self.factory.rand_staff(self.factory.mtn).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.factory.rand_family(self.factory.mtn)).adult.pk
        }

        self.assessment_fbb_family_a = FamilyAssessment.objects.create(
            ref_assessment_interval=self.interval,
            assessment_date='2014-05-01',
            family=self.fbb_family_a,
            employee=self.fbb_staff,
            primary_caregiver=self.factory.get_primary_adult(self.fbb_family_a).adult
        )

        self.assessment_fbb_family_b = FamilyAssessment.objects.create(
            ref_assessment_interval=self.interval,
            assessment_date='2014-05-01',
            family=self.fbb_family_b,
            employee=self.fbb_staff,
            primary_caregiver=self.factory.get_primary_adult(self.fbb_family_b).adult
        )

        self.assessment_mtn_family_a = FamilyAssessment.objects.create(
            ref_assessment_interval=self.interval,
            assessment_date='2014-05-01',
            family=self.mtn_family_a,
            employee=self.mtn_staff,
            primary_caregiver=self.factory.get_primary_adult(self.mtn_family_a).adult
        )

        self.assessment_mtn_family_b = FamilyAssessment.objects.create(
            ref_assessment_interval=self.interval,
            assessment_date='2014-05-01',
            family=self.mtn_family_b,
            employee=self.mtn_staff,
            primary_caregiver=self.factory.get_primary_adult(self.mtn_family_b).adult
        )

    def test_globalreadonly_can_get_all_records(self):
        list_url = reverse('family-assessment-list')

        response = self.factory.global_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_a).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_b).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.mtn_family_a).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.mtn_family_b).filter(
            family_id__in=ids)
        )

    def test_globaladmin_can_get_all_records(self):
        list_url = reverse('family-assessment-list')

        response = self.factory.global_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_a).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_b).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.mtn_family_a).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.mtn_family_b).filter(
            family_id__in=ids)
        )

    def test_fbb_readonly_can_get_fbb_records(self):
        list_url = reverse('family-assessment-list')

        response = self.factory.fbb_readonly_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_a).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_b).filter(
            family_id__in=ids)
        )

        self.assertFalse(FamilyAssessment.objects.filter(
            family=self.mtn_family_a).filter(
            family_id__in=ids)
        )

        self.assertFalse(FamilyAssessment.objects.filter(
            family=self.mtn_family_b).filter(
            family_id__in=ids)
        )

    def test_fbb_readwrite_can_get_fbb_records(self):
        list_url = reverse('family-assessment-list')

        response = self.factory.fbb_readwrite_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_a).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_b).filter(
            family_id__in=ids)
        )

        self.assertFalse(FamilyAssessment.objects.filter(
            family=self.mtn_family_a).filter(
            family_id__in=ids)
        )

        self.assertFalse(FamilyAssessment.objects.filter(
            family=self.mtn_family_b).filter(
            family_id__in=ids)
        )

    def test_fbb_admin_can_get_fbb_records(self):
        list_url = reverse('family-assessment-list')

        response = self.factory.fbb_admin_client.get(list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = []
        for item in response.data['results']:
            ids.append(
                item['family']
            )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_a).filter(
            family_id__in=ids)
        )

        self.assertTrue(FamilyAssessment.objects.filter(
            family=self.fbb_family_b).filter(
            family_id__in=ids)
        )

        self.assertFalse(FamilyAssessment.objects.filter(
            family=self.mtn_family_a).filter(
            family_id__in=ids)
        )

        self.assertFalse(FamilyAssessment.objects.filter(
            family=self.mtn_family_b).filter(
            family_id__in=ids)
        )

    def test_global_readonly_cannot_create_an_fbb_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.global_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_create_an_fbb_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.global_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_fbb_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_create_an_fbb_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_admin_can_create_an_fbb_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.fbb_admin_client.post(create_url, self.fbb_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fbb_readonly_cannot_create_an_mtn_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.fbb_readonly_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_create_an_mtn_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.fbb_readwrite_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_cannot_create_an_mtn_record(self):
        create_url = reverse('family-assessment-list')

        response = self.factory.fbb_admin_client.post(create_url, self.mtn_post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_readonly_cannot_update_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.fbb_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.fbb).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.fbb_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.global_readonly_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_update_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.fbb_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.fbb).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.fbb_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.global_admin_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.fbb_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.fbb).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.fbb_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_update_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.fbb_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.fbb).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.fbb_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_admin_can_update_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.fbb_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.fbb).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.fbb_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fbb_readonly_cannot_update_an_mtn_record(self):
        assessment = self.assessment_mtn_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.mtn_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.mtn).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.mtn_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readonly_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_fbb_readwrite_cannot_update_an_mtn_record(self):
        assessment = self.assessment_mtn_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.mtn_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.mtn).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.mtn_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readwrite_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_fbb_admin_cannot_update_an_mtn_record(self):
        assessment = self.assessment_mtn_family_a

        patch_data = {
            "ref_assessment_interval": self.interval.ref_assessment_interval_id,
            "assessment_date": '2015-04-26',
            "family": self.mtn_family_a.pk,
            "employee": self.factory.rand_staff(self.factory.mtn).pk,
            "primary_caregiver": self.factory.get_primary_adult(self.mtn_family_a.pk).adult.pk
        }

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_admin_client.patch(
            detail_url, patch_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_global_readonly_cannot_delete_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.global_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_global_admin_can_delete_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.global_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_can_delete_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_admin_can_delete_an_fbb_record(self):
        assessment = self.assessment_fbb_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_fbb_readonly_cannot_delete_an_mtn_record(self):
        assessment = self.assessment_mtn_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readonly_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_readwrite_cannot_delete_an_mtn_record(self):
        assessment = self.assessment_mtn_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_readwrite_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fbb_admin_cannot_delete_an_mtn_record(self):
        assessment = self.assessment_mtn_family_a

        detail_url = reverse('family-assessment-detail', args=[assessment.pk])

        response = self.factory.fbb_admin_client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)