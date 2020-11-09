/**
 * Inspired by https://dororongju.tistory.com/151
 */
class Chat {
    constructor() {
        this.myName = "Me";
        this.init = false;
        this.lastSender = "";
        
        this.createMessageTag = this.createMessageTag.bind(this);
        this.appendMessageTag = this.appendMessageTag.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.clearTextarea = this.clearTextarea.bind(this);
        this.receive = this.receive.bind(this);
    }
 
    createMessageTag(LR_className, senderName, message) {
        let chatLi;
        if (!this.init) {
          chatLi = $('div.chat.format ul li').clone();
          this.init = true;
        } else {
          chatLi = $('#mainChat ul li').last().clone();
        }
        const nameElem = chatLi.find('.sender span');
        const messageElem = chatLi.find('.message span');
 
        chatLi.addClass(LR_className);
        if (this.lastSender != senderName) {
          nameElem.text(senderName);
          this.lastSender = senderName
        } else {
          nameElem.text("");
        }
        messageElem.text(message);
 
        return chatLi;
    }
 
    appendMessageTag(LR_className, senderName, message) {
        const chatLi = this.createMessageTag(LR_className, senderName, message);
        $('div.chat:not(.format) ul').append(chatLi);
        $('div.chat').scrollTop($('div.chat').prop('scrollHeight'));
    }
 
    sendMessage(message) {
        // FIXME. Should send this to the server
        const data = {
            senderName: this.myName,
            message: message
        };
 
        // FIXME. Should receive this from the server
        this.receive(data);
    }
 
    clearTextarea() {
        $('div.input-div textarea').val('');
    }
 
    receive(data) {
        const LR = (data.senderName != this.myName)? "left" : "right";
        this.appendMessageTag("right", data.senderName, data.message);
    }
};
 
$(() => {
    const chat = new Chat();
    $(document).on('keydown', 'div.input-div textarea', function(event) {
        // keyCode(Enter) == 13
        if(event.keyCode == 13 && !event.shiftKey) {
            event.preventDefault();
            const message = $(this).val();
            if (message === "")
              return;

            chat.sendMessage(message);
            chat.clearTextarea();
        }
    });
});
