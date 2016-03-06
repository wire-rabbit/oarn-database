import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By

class BasicFunctionalTest(unittest.TestCase):
    def setUp(self):
        self.root_url = 'http://localhost:8000/'
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)

    def tearDown(self):
        self.browser.quit()

    def test_login(self):
        # Alison has received her OARN database credentials and wants to try logging in to the
        # test organization. Her username is 'admin_a' and her password is 'secret'

        # She opens Firefox and goes to the login page.
        self.browser.get(self.root_url)
        self.assertEqual(self.browser.title, "OARN Relief Nursery Database")

        # She enters her username and password and hits enter.
        username_box = self.browser.find_element_by_id('app_primaryContainer_loginPopup_txtUsername')
        username_box.clear()
        username_box.send_keys('admin_a')

        password_box = self.browser.find_element_by_id('app_primaryContainer_loginPopup_txtPassword')
        password_box.clear()
        password_box.send_keys('secret')
        password_box.send_keys(Keys.RETURN)

        # Now on the main screen, she sees that no individual adults or children are yet listed:
        search_results_box = self.browser.find_element_by_id('app_primaryContainer_searchResults_noResultsLabel')
        self.assertEqual(search_results_box.text, 'No Results')

    def test_searchbar(self):
        # Alison wants to lookup Starr Abdin (a child) in the demo database.

        # She opens Firefox and goes to the login page.
        self.browser.get(self.root_url)
        self.assertEqual(self.browser.title, "OARN Relief Nursery Database")

        # She enters her username and password and hits enter.
        username_box = self.browser.find_element_by_id('app_primaryContainer_loginPopup_txtUsername')
        username_box.clear()
        username_box.send_keys('admin_a')

        password_box = self.browser.find_element_by_id('app_primaryContainer_loginPopup_txtPassword')
        password_box.clear()
        password_box.send_keys('secret')
        password_box.send_keys(Keys.RETURN)

        # First, she enters the full name of the child into the search box and hits enter:
        search_box = self.browser.find_element_by_id('app_primaryContainer_searchBox')
        search_box.send_keys('Starr Abdin')
        search_box.send_keys(Keys.RETURN)

        # She neglected to select a search type beforehand, so a popup appears alerting her to this:
        popup = self.browser.find_element_by_id('app_primaryContainer_infoTitle')
        self.assertTrue(popup.is_displayed())
        self.assertEqual('Search Help', popup.text)

        # Alison clicks away to dismiss the popup
        search_panel = self.browser.find_element_by_id('app_primaryContainer_scroller')
        action = webdriver.ActionChains(self.browser)
        action.move_to_element_with_offset(search_panel,20, 20) # just in a bit from the corner
        action.click()
        action.perform()
        self.assertFalse(popup.is_displayed())

        # ... and selects 'Child by full name' from the Search Type menu:
        search_menu = self.browser.find_element_by_id('app_primaryContainer_searchTypeMenu_menuTitle')
        search_menu.click()
        child_search_option = self.browser.find_element_by_id('app_primaryContainer_searchTypeMenu_menuItem2')
        child_search_option.click()
        # She notices the menu title now reflects her selection:
        self.assertEqual(search_menu.text, 'Child by full name')

        # Alison enters the child's full name again and clicks the search icon:
        search_box.clear()
        search_box.send_keys('Starr Abdin')
        search_icon = self.browser.find_element_by_id('app_primaryContainer_searchButton')
        search_icon.click()

        # And Alison notices that the child appears in the search results list:
        search_results = self.browser.find_element_by_id('app_primaryContainer_searchResults_control2_item_wrapper')
        found_element = None

        result_is_present = False
        for element in search_results.find_elements_by_tag_name('span'):
            if element.text == 'Abdin':
                result_is_present = True
                found_element = element

        self.assertTrue(result_is_present)

        # Alison clicks on the child's name and waits for the related families to appear:
        found_element.click()
        found_families = self.browser.find_element_by_id('app_primaryContainer_foundFamilies_control')
        self.assertTrue(found_families.is_displayed())

        # She sees the primary adult (Raisa Mcfarlan) listed with the family ID:
        family_list_item = self.browser.find_elements(By.XPATH, '//span[contains(., "Raisa")]')
        self.assertTrue(len(family_list_item) > 0)

if __name__ == '__main__':
    unittest.main(warnings='ignore')
