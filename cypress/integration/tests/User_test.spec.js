describe('Execute', function(){
    // it('Login Possible', function(){
    //     cy.visit('https://accounts.kakao.com/login?continue=https%3A%2F%2Fkauth.kakao.com%2Foauth%2Fauthorize%3Fproxy%3DeasyXDM_Kakao_mftlg0m7ci8_provider%26ka%3Dsdk%252F1.39.10%2520os%252Fjavascript%2520sdk_type%252Fjavascript%2520lang%252Fko-KR%2520device%252FWin32%2520origin%252Fhttp%25253A%25252F%25252Fsimon-park.codes%26scope%3Daccount_email%252Cprofile%26origin%3Dhttp%253A%252F%252Fsimon-park.codes%26response_type%3Dcode%26redirect_uri%3Dkakaojs%26state%3D3ntj1ihmwe3ufy1yjsooa%26client_id%3D3634d739399c9436fa103280f8e6cb34')
    //     // TODO: Enter email and password
    //     cy.get('label').contains('email').type('Valid Email or Phone Number')
    //     cy.wait(500)
    //     cy.get('label').contains('Password').type('Valid Password')
    //     cy.wait(500)
    //     // cy.get('span[class="ico_account ico_check"]').eq(0).click()
    //     cy.get('button[type="button"]').contains('Log In').click()
    // })

    it('Load Page', function(){
        cy.visit('http://simon-park.codes/')
        cy.wait(3000)
        cy.title().should('eq', 'CodeLive')
        cy.url().should('match', /[\w\d]{6}$/)
        cy.get('span[id="peers-holder"]').should(($peer) => {
            const text = $peer.text()
            expect(text).to.match(/[\w\s]+/)
        })
    })

    it('Dark Mode Light Mode', function(){
        cy.get('a[href*="#tabView"]').click()
        cy.wait(500)
        cy.contains('Dark Mode').should('be.visible')
        cy.get('span[class="slider round"]').click()
        cy.wait(1000)
        cy.get('div[class="row vertical-center bg-light"]').should('have.css', 'background-color', 'rgb(248, 249, 250)')
        cy.get('span[class="slider round"]').click()
        cy.wait(1000)
        cy.get('div[class="row vertical-center bg-dark"]').should('have.css', 'background-color', 'rgb(52, 58, 64)')
    })

    it('Python Code', function(){
        cy.get('a[href*="#tabFile"]').click()
        cy.wait(1500)
        cy.contains('Execute').should('be.visible')
        cy.get('button[type="button"]').contains('Execute').should('be.visible')
        cy.get('pre[class=" CodeMirror-line "]').click().type('#Enter Two Numbers{enter}x = int(input()){enter}y = int(input()){enter}#Get Sum{enter}z = x + y{enter}{enter}#Print Output{enter}print("The sum of two numbers is", z){enter}')
        cy.wait(1000)
        cy.contains('#Enter Two Numbers').should('be.visible')
        cy.get('textarea[id="script-input"]').type('10{enter}5')
        cy.wait(500)
        cy.get('.btn').contains('Execute').click()
        cy.wait(5000)
        cy.get('textarea[id="console"]').should('have.value', 'The sum of two numbers is 15\n')
    })

    it('Comment', function(){
        cy.get('pre[class=" CodeMirror-line "]').eq(0).click().type('{ctrl+/}')
        cy.wait(1000)
        cy.get('span[class="cm-variable"]').should(($line) => {
            expect($line.eq(0)).to.contain('Enter')
        })
        cy.get('pre[class=" CodeMirror-line "]').eq(0).click().type('{ctrl+/}')
        cy.wait(1000)
        cy.get('span[class="cm-comment"]').should(($line) => {
            expect($line.eq(0)).to.contain('# Enter Two Numbers')
        })
    })

    it('Change Language', function(){
        cy.contains('Execute').should('be.visible')
        cy.get('button[id="btnLanguageGroupDrop"]').click()
        cy.wait(500)
        cy.get('.dropdown-item').contains('C++').click()
        cy.wait(1500)
        cy.get('pre[class=" CodeMirror-line "]').eq(0).click().type('{ctrl+a}{backspace}#include <iostream> {backspace}{enter}using namespace std;{enter}{enter}int main(){enter}{{}{enter}int num1, num2, num3;{enter}cin >> num1 >> num2;{enter}num3 = num1 + num2;{enter}cout << "The sum of two numbers is " << num3;{enter}return 0;{enter}{}}{enter}')
        cy.wait(1000)
        cy.contains('#include <iostream>').should('be.visible')
        cy.get('textarea[id="script-input"]').type('{selectall}{backspace}10{enter}15')
        cy.wait(500)
        cy.get('.btn').contains('Execute').click()
        cy.wait(5000)
        cy.get('textarea[id="console"]').should('have.value', 'The sum of two numbers is 25')
    })

    it('Find', function(){
        cy.get('pre[class=" CodeMirror-line "]').eq(0).click().type('{ctrl+f}num3{enter}')
        cy.wait(1000)
        cy.get('span[class="cm-variable cm-overlay cm-searching"]').should(($line) => {
            expect($line).to.contain('num3')
        })
        cy.get('span[class="cm-variable cm-overlay cm-searching"]').should('have.length', 3)
    })

    it('Replace', function(){
        cy.get('pre[class=" CodeMirror-line "]').eq(0).click().type('{ctrl+shift+r}num3{enter}NUM3{enter}')
        cy.wait(1000)
        cy.get('span[class="cm-variable cm-overlay cm-searching"]').should(($line) => {
            expect($line).to.contain('NUM3')
        })
        cy.get('span[class="cm-variable cm-overlay cm-searching"]').should('have.length', 3)
    })

    it('Vim', function(){
        cy.get('a[href*="#tabView"]').click()
        cy.wait(500)
        cy.contains('Dark Mode').should('be.visible')
        cy.get('button[id="vim"]').click()
        cy.get('pre[class=" CodeMirror-line "]').eq(8).click().type('{shift}Y{shift}P')
        cy.wait(500)
        cy.get('pre[class=" CodeMirror-line "]').eq(9).should(($line) => {
            const line = $line.text()
            expect(line).to.contain('cout << "The sum of two numbers is " << NUM3;')
        })
    })

    it('Emacs', function(){
        cy.contains('Dark Mode').should('be.visible')
        cy.get('button[id="emacs"]').click()
        cy.get('pre[class=" CodeMirror-line "]').eq(10).click().type('{ctrl+o}')
        cy.wait(500)
        cy.get('pre[class=" CodeMirror-line "]').eq(11).should(($line) => {
            const line = $line.text()
            expect(line).to.contain('')
        })
    })

    it('Change Tab', function(){
        cy.contains('Dark Mode').should('be.visible')
        cy.get('button[id="btnTabSizeGroupDrop"]').click()
        cy.wait(500)
        cy.get('.dropdown-item').contains('2').click()
        cy.wait(1000)
        cy.get('button[id="btnTabSizeGroupDrop"]').should(($tab) => {
            expect($tab).to.contain('2')
        })
    })

    it('Change Font', function(){
        cy.contains('Dark Mode').should('be.visible')
        cy.get('button[id="btnFontSizeGroupDrop"]').click()
        cy.wait(500)
        cy.get('.dropdown-item').contains('10').click()
        cy.wait(1000)
        cy.get('button[id="btnFontSizeGroupDrop"]').should(($font) => {
            expect($font).to.contain('10')
        })
    })

    it('Chat', function(){
        cy.get('a[href*="#tabChat"]').click()
        cy.wait(500)
        cy.contains('CHAT').should('be.visible')
        cy.get('textarea[placeholder="Press Enter to send the message."]').type('test chat 1{enter}')
        cy.wait(500)
        cy.get('textarea[placeholder="Press Enter to send the message."]').type('test chat 2{enter}')
        cy.wait(500)
        cy.get('div[class="message"]').should(($chat) => {
            expect($chat.eq(0)).to.contain('test chat 1')
            expect($chat.eq(1)).to.contain('test chat 2')
        })
    })

    it('Voice Chat', function(){
        cy.contains('CHAT').should('be.visible')
        cy.get('button[id="voice_toggle"]').click()
        cy.wait(1000)
        cy.get('span[id="peers-holder"]').then(($peer) => {
            const text = $peer.text()
            cy.get('div[id="voice_peers"]').should('contain', text)
        })
        cy.get('button[id="voice_toggle"]').click()
        cy.wait(1000)
        cy.get('span[id="peers-holder"]').then(($peer) => {
            const text = $peer.text()
            cy.get('div[id="voice_peers"]').should('not.be.visible', text)
        })
    })

    it('Modal', function(){
        cy.get('button[class="modal-button"]').click()
        cy.wait(1000)
        cy.get('h6[class="text-muted"]').should(($tab) => {
            expect($tab.eq(0)).to.contain('Vim')
            expect($tab.eq(1)).to.contain('Emacs')
        })
        cy.get('h6[class="font-weight-bold"]').should(($tab) => {
            expect($tab).to.contain('Sublime')
        })
        cy.get('div[id="tab03"]').click()
        cy.wait(1000)
        cy.get('h6[class="text-muted"]').should(($tab) => {
            expect($tab.eq(0)).to.contain('Sublime')
            expect($tab.eq(1)).to.contain('Emacs')
        })
        cy.get('h6[class="font-weight-bold"]').should(($tab) => {
            expect($tab).to.contain('Vim')
        })
        cy.get('div[id="tab04"]').click()
        cy.wait(1000)
        cy.get('h6[class="text-muted"]').should(($tab) => {
            expect($tab.eq(0)).to.contain('Sublime')
            expect($tab.eq(1)).to.contain('Vim')
        })
        cy.get('h6[class="font-weight-bold"]').should(($tab) => {
            expect($tab).to.contain('Emacs')
        })
        cy.get('div[id="myModal"]').click(1, 1)
        cy.title().should('eq', 'CodeLive')
    })
 
    it('Login Button', function(){
        cy.get('.btn').contains('Login').should('be.visible').click()
        // cy.get('button[id="logout_btn"]').contains('Log Out').should('be.visible')
    })
})

