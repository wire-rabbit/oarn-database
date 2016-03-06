from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User, Group
from django.core.urlresolvers import reverse
from oarndb.models import Organization


class ReferenceViewsTestCase(APITestCase):
    """
    Basic permissions and validations tests for reference model views.
    """

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
        self.record_a = {'code': 'A', 'description': 'Alpha', 'sort_order': 1.0, 'universal': True}
        self.record_b = {'code': 'B', 'description': 'Beta', 'sort_order': 2.0, 'organization': self.fbb.pk}
        self.record_g = {'code': 'G', 'description': 'Gamma', 'sort_order': 3.0, 'organization': self.fbb.pk}
        self.record_d = {'code': 'D', 'description': 'Delta', 'sort_order': 4.0, 'organization': self.mtn.pk}
        self.record_e = {'code': 'E', 'description': 'Epsilon', 'sort_order': 5.0, 'universal': True}
        self.bad_record_1 = {'code': 'BAD', 'description': 'Fails', 'sort_order': 5.5, 'universal': True,
                             'organization': self.fbb.pk}
        self.bad_record_2 = {'code': 'BAD', 'description': 'Fails', 'sort_order': 5.7, 'universal': False}

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

    def generic_view_list_test(self, url):
        # 1) create some test entries via POST:

        # *** global_readonly_user
        # POST should fail for record_a because setting universal requires global admin rights:
        response = self.global_readonly_client.post(url, self.record_a, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # POST should fail for record_b because setting an org requires admin rights to it:
        response = self.global_readonly_client.post(url, self.record_b, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # *** global_admin_user
        # POST should succeed for record_a:
        response = self.global_admin_client.post(url, self.record_a, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # POST should succeed for record_e:
        response = self.global_admin_client.post(url, self.record_e, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # POST should fail for bad_record_1 (both org and universal are set):
        response = self.global_admin_client.post(url, self.bad_record_1, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # POST should fail for bad_record_2 (neither org nor universal are set):
        response = self.global_admin_client.post(url, self.bad_record_2, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # *** fbb_readonly user
        # POST should fail for record_a because setting universal requires global admin rights:
        response = self.fbb_readonly_client.post(url, self.record_a, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # POST should fail for record_b because user lacks admin rights to FBB:
        response = self.fbb_readonly_client.post(url, self.record_b, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # *** fbb_readwrite user should behave just as fbb_readonly user since ref tables require admin access to update
        # POST should fail for record_a because setting universal requires global admin rights:
        response = self.fbb_readwrite_client.post(url, self.record_a, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # POST should fail for record_b because user lacks admin rights to FBB:
        response = self.fbb_readwrite_client.post(url, self.record_b, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # *** fbb_admin user
        # POST should succeed for record_b:
        response = self.fbb_admin_client.post(url, self.record_b, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # POST should succeed for regord_g:
        response = self.fbb_admin_client.post(url, self.record_g, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # POST should fail for record_d because user lacks admin rights to MTN:
        response = self.fbb_admin_client.post(url, self.record_d, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # *** mtn_readonly user
        # POST should fail for record_d because user lacks admin rights to MTN:
        response = self.mtn_readonly_client.post(url, self.record_d, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # POST should fail for record_b because user lacks admin rights to FBB:
        response = self.mtn_readonly_client.post(url, self.record_b, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # *** mtn_readwrite user should behave just as mtn_readonly user since ref tables require admin access to update
        # POST should fail for record_d because user lacks admin rights to MTN:
        response = self.mtn_readwrite_client.post(url, self.record_d, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # POST should fail for record_b because user lacks admin rights to FBB:
        response = self.mtn_readwrite_client.post(url, self.record_b, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # *** mtn_admin user
        # POST should fail for record_g because user lacks admin rights to FBB:
        response = self.mtn_admin_client.post(url, self.record_g, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # POST should succeed for record_d:
        response = self.mtn_admin_client.post(url, self.record_d, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2) Test GET results:
        response = self.global_admin_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Beta', response.data['results'][1]['description'])
        self.assertEqual('Gamma', response.data['results'][2]['description'])
        self.assertEqual('Delta', response.data['results'][3]['description'])
        self.assertEqual('Epsilon', response.data['results'][4]['description'])

        response = self.global_readonly_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Beta', response.data['results'][1]['description'])
        self.assertEqual('Gamma', response.data['results'][2]['description'])
        self.assertEqual('Delta', response.data['results'][3]['description'])
        self.assertEqual('Epsilon', response.data['results'][4]['description'])

        response = self.fbb_readonly_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Beta', response.data['results'][1]['description'])
        self.assertEqual('Gamma', response.data['results'][2]['description'])
        self.assertEqual('Epsilon', response.data['results'][3]['description'])

        response = self.fbb_readwrite_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Beta', response.data['results'][1]['description'])
        self.assertEqual('Gamma', response.data['results'][2]['description'])
        self.assertEqual('Epsilon', response.data['results'][3]['description'])

        response = self.fbb_admin_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Beta', response.data['results'][1]['description'])
        self.assertEqual('Gamma', response.data['results'][2]['description'])
        self.assertEqual('Epsilon', response.data['results'][3]['description'])

        response = self.mtn_readonly_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Delta', response.data['results'][1]['description'])
        self.assertEqual('Epsilon', response.data['results'][2]['description'])

        response = self.mtn_readwrite_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Delta', response.data['results'][1]['description'])
        self.assertEqual('Epsilon', response.data['results'][2]['description'])

        response = self.mtn_admin_client.get(url)
        self.assertTrue(len(list(response.data)) > 0)
        self.assertEqual('Alpha', response.data['results'][0]['description'])
        self.assertEqual('Delta', response.data['results'][1]['description'])
        self.assertEqual('Epsilon', response.data['results'][2]['description'])

    def test_adult_child_relationship_types(self):
        self.generic_view_list_test(reverse('adult-child-relationship-types-list'))

    def test_languages_list(self):
        self.generic_view_list_test(reverse('languages-list'))

    def test_language_use_types(self):
        self.generic_view_list_test(reverse('language-use-types-list'))

    def test_adult_family_relationship_types(self):
        self.generic_view_list_test(reverse('adult-family-relationship-types-list'))

    def test_child_family_relationship_types(self):
        self.generic_view_list_test(reverse('child-family-relationship-types-list'))

    def test_races(self):
        self.generic_view_list_test(reverse('races-list'))

    def test_genders(self):
        self.generic_view_list_test(reverse('genders-list'))

    def test_person_telephone_numbers(self):
        self.generic_view_list_test(reverse('person-telephone-numbers-list'))

    def test_email_types(self):
        self.generic_view_list_test(reverse('email-types-list'))

    def test_counties(self):
        self.generic_view_list_test(reverse('counties-list'))

    def test_states(self):
        self.generic_view_list_test(reverse('states-list'))

    def test_location_types(self):
        self.generic_view_list_test(reverse('location-types-list'))

    def test_roles(self):
        self.generic_view_list_test(reverse('roles-list'))

    def test_contact_types(self):
        self.generic_view_list_test(reverse('contact-types-list'))

    def test_programs(self):
        self.generic_view_list_test(reverse('programs-list'))

    def test_marital_status(self):
        self.generic_view_list_test(reverse('marital-status-list'))

    def test_employment_status(self):
        self.generic_view_list_test(reverse('employment-status-list'))

    def test_gross_monthly_income(self):
        self.generic_view_list_test(reverse('gross-monthly-income-list'))

    def test_size_of_family(self):
        self.generic_view_list_test(reverse('size-of-family-list'))

    def test_emergency_services(self):
        self.generic_view_list_test(reverse('emergency-services-list'))

    def test_reading_frequency(self):
        self.generic_view_list_test(reverse('reading-frequency-list'))

    def test_strengths_scale(self):
        self.generic_view_list_test(reverse('strengths-scale-list'))

    def test_smoke_exposure_scale(self):
        self.generic_view_list_test(reverse('smoke-exposure-scale-list'))

    def test_quality_scale(self):
        self.generic_view_list_test(reverse('quality-scale-list'))

    def test_assessment_interval(self):
        self.generic_view_list_test(reverse('assessment-interval-list'))