import {faker} from '@faker-js/faker'

describe('OrangeHRM Demo Site END to End Testing Flow', () => {
  const adminUsername = "Admin";
  const adminPassword = "admin123";
  const employeeDetailsFile = "employeeDetails.json"
  
  before(() => {
    cy.visit('/');
    cy.title().should("eq", "OrangeHRM");

    //############################################### [ START OF ADMIN LOGIN ] #####################################################
    cy.get("input[name='username']").type(adminUsername);
    cy.get("input[name='password']").type(adminPassword);
    cy.get("button[type='submit']").click();
    //##############################################################################################################################
  });
  it('OrangeHRM Demo Site END to End Flow', () => {
      
      //############################################ [ START OF ASSERTING DASHBOARD ] #################################################
      cy.url().should("include","/dashboard");   //Assert the dashboard url
      cy.waitForElementVisibility("h6");
      cy.get("h6").should("have.text","Dashboard");
      //##############################################################################################################################

      //################################### [ START OF NAVIGATING TO PIM AND ASSERTING ELEMENTS ] ####################################
      cy.get("span").contains("PIM").click();
      cy.url().should("include", "/pim/viewEmployeeList");
      cy.waitForElementVisibility("h6");
      cy.get("h6").should("have.text","PIM"); 
      //##############################################################################################################################

      //###################### [ START OF NAVIGATING TO EMPLOYEE CREATION PAGE AND ASSERTING THE ELEMENTS ] ##########################
      cy.get("button").contains("Add").click();
      cy.url().should("include", "/pim/addEmployee");
      cy.waitForElementVisibility("h6").and("contain","Add Employee");
      //##############################################################################################################################

      //############################## [ START OF GENERATING RANDOM EMPLOYEE DATA AND USING FAKER LIBRARY ] ##########################
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = firstName+" "+lastName;
      const password = faker.string.alphanumeric(12)+faker.string.numeric(1)+faker.string.symbol(1)+faker.string.alpha({ casing: "upper" })+faker.string.alpha({ casing: 'lower' });
      const employeeId = faker.datatype.number({ min: 1000, max: 9999 });
      //##############################################################################################################################

      //############################################### [ START OF EMPLOYEE CREATION ] ###############################################
      cy.get("input[name='firstName']").type(firstName);
      cy.get("input[name='lastName']").type(lastName);
      cy.get("label").contains("Employee Id").parent().siblings("div").find("input").clear();
      cy.get("label").contains("Employee Id").parent().siblings("div").find("input").type(employeeId);
      cy.get("input[type='checkbox']").click({ force: true });
      cy.get("button[type='Submit']").click();
      
      cy.get("label").contains("Username").parent().siblings("div").find("input").type(username);
      cy.get("div.user-password-cell input[type='password']").type(password);
      cy.get("label").contains("Confirm Password").parent().siblings("div").find("input").type(password);
      cy.get("button[type='submit']").click();
      //##############################################################################################################################
      
      //########## [ START OF ASSERTING THE SUCCESSFUL EMPLOYEE CREATION MESSAGE AND PERSONAL DETAILS OF THE CREATED USER ] ##########
      cy.get('.oxd-text--toast-message').should("have.text", "Successfully Saved");   // Assert the Employee Creation Notification Message
      cy.waitForElementVisibility("h6").and("contain","Personal Details");
      cy.get("h6").should("contain", username);
      //##############################################################################################################################

      //############################ [ START OF SAVING EMPLOYEE DETAILS IN A JSON FILE UNDER FIXTURES ] ##############################
      const employeeDetails = { employeeId, firstName, lastName, username, password };
      const filePath = `cypress/fixtures/${employeeDetailsFile}`;
      cy.writeFile(filePath, employeeDetails);
      //##############################################################################################################################

      //##### [ START OF NAVIGATING TO PIM/EMPLOYEE LIST PAGE, SEARCH WITH EMPLOYEE ID AND ASSERT THE CREATED EMPLOYEE DETAILS ] #####
      cy.get("li").contains("Employee List").click();
      cy.waitForElementVisibility("h5").and("contain","Employee Information");
      cy.get("label").contains("Employee Id").parent().siblings("div").find("input").type(employeeId);
      cy.get("button[type='submit']").click();

      cy.get("div.oxd-table-card>div>div:nth-child(2)>div").should("have.text",employeeId);
      cy.get('div.oxd-table-card>div>div:nth-child(3)>div').invoke('text').then((text) => {
        const trimmedFirstName = text.trim();
        expect(trimmedFirstName).to.equal(firstName);
      });
      cy.get('div.oxd-table-card>div>div:nth-child(4)>div').invoke('text').then((text) => {
        const trimmedLastName = text.trim();
        expect(trimmedLastName).to.equal(lastName);
      });
      // cy.get("div.oxd-table-card>div>div:nth-child(4)>div").should("have.text",lastName);
      //##############################################################################################################################

      //############# [ START OF NAVIGATIONG TO DIRECTORY, SEARCHING CREATED EMPLOYEE AND ASSERTING THE EMPLOYEE NAME ] ##############
      cy.get("span").contains("Directory").click();
      cy.get("input[placeholder='Type for hints...']").type(firstName);

      cy.waitForElementVisibility(".oxd-autocomplete-option > span").and("contain",firstName);
      cy.get(".oxd-autocomplete-option>span").click();
      cy.get("button[type='submit']").click();

      cy.get(".orangehrm-directory-card-header").invoke("text").then((text) => {
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        expect(normalizedText).to.eq(username);
      });
      //##############################################################################################################################

      //####################################### [ START OF LOGOUT FROM ADMIN USER'S PROFILE ] ########################################
      cy.get(".oxd-userdropdown-name").click();
      cy.get("a[href='/web/index.php/auth/logout']").click();
      cy.waitForElementVisibility("h5").and("contain","Login");
      //##############################################################################################################################

      //############################################## [ START OF EMPLOYEE LOGIN ] ###################################################
      cy.fixture(employeeDetailsFile).then((employee) => {
        cy.get("input[name='username']").type(employee.username);
        cy.get("input[name='password']").type(employee.password);
        cy.get("button[type='submit']").click();

        cy.get(".oxd-userdropdown-name").should("contain", username);
      });
      //##############################################################################################################################

      //########################### [ START OF NAVIGATING TO MY INFO, GENERATING RANDOM VALUE AND UPDATING EMPLOYEE INFORMATION ] #############################
      const gender = [1, 2][Math.floor(Math.random() * 2)];
      
      cy.get("span").contains("My Info").click();  //Navigate to My Info
      cy.waitForElementVisibility("h6").and("contain","Personal Details");
      cy.waitForElementVisibility("h6").and("contain","Custom Fields");

      cy.waitForElementVisibility(`input[type='radio'][value='${gender}']+span`);
      cy.get(`input[type='radio'][value='${gender}']+span`).should("be.visible").click({force : true});
      cy.xpath("(//button[@type='submit'])[1]").click();
      cy.get('.oxd-toast').should('contain', 'Successfully Updated');
      
      cy.xpath("//label[text()='Blood Type']/following::div[@class='oxd-select-text-input']").click();
      cy.xpath("//label[text()='Blood Type']/following::div[@class='oxd-select-option'][not(text()='-- Select --')]").then($options => {
      const optionsArray = [];

      $options.each((index, element) => {
        optionsArray.push(element.innerText.trim());
      });
      const randomOption = optionsArray[Math.floor(Math.random() * optionsArray.length)];
      cy.contains('.oxd-select-option', randomOption).click();
      });
      cy.xpath("(//button[@type='submit'])[2]").click();

      cy.get('.oxd-toast').should('contain', 'Successfully Updated');
      //##############################################################################################################################


  });
  after(() => {
    //################################# [ START OF LOGOUT FROM NEWLY CREATED EMPLOYEE'S PROFILE ] ##################################
    cy.get(".oxd-userdropdown-name").click();
    cy.get("a[href='/web/index.php/auth/logout']").click();
    cy.waitForElementVisibility("h5").and("contain","Login");
    //##############################################################################################################################

  });
});