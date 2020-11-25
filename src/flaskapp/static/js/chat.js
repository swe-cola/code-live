/**
 * Inspired by https://dororongju.tistory.com/151
 */
class Chat {
    constructor() {
        this.clientId = getCookie(CODE_LIVE_COOKIE);
        this.docId = documentName;
        this.initName.call(this);

        this.lastSender = undefined;
        this.init = false;

        this.socket = io(`${CHAT_SERVER_HOST}:${CHAT_SERVER_PORT}`);
        this.socket.on('chat-message', (msg) => {
            this.receive(msg);
        })

        this.createMessageTag = this.createMessageTag.bind(this);
        this.appendMessageTag = this.appendMessageTag.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.clearTextarea = this.clearTextarea.bind(this);
        this.receive = this.receive.bind(this);
    }

    initName() {
        this.nickname = this.clientId; // Use clientId in case ajax fails
        $.ajax({
          crossDomain: true,
          url: '/api/nickname',
          type: "POST",
          data: {
            clientID: this.clientId,
            docID: this.docId
          },
        }).done((data) => {
          this.nickname = data;
          this.socket.emit('chat-register', {
              docId: this.docId,
              senderName: this.nickname,
              senderId: this.clientId,
              message: '',
          });
        });
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

        chatLi.removeClass();
        chatLi.addClass(LR_className);
        if (this.lastSender != senderName) {
          nameElem.text((senderName === this.nickname) ? 'Me' : senderName);
          this.lastSender = senderName
        } else {
          nameElem.text('');
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
        const data = {
            docId: this.docId,
            senderName: this.nickname,
            senderId: this.clientId,
            message: message,
        };
        this.socket.emit('chat-message', data);
    }

    clearTextarea() {
        $('div.input-div textarea').val('');
    }

    receive(data) {
        const LR = (data.senderName !== this.nickname) ? 'left' : 'right';
        this.appendMessageTag(LR, data.senderName, data.message);
    }
};

$(() => {
    const chat = new Chat();
    $(document).on('keydown', 'div.input-div textarea', function(event) {
        // keyCode(Enter) == 13
        if(event.keyCode == 13 && !event.shiftKey) {
            event.preventDefault();
            const message = $(this).val();
            if (message === '')
              return;

            chat.sendMessage(message);
            chat.clearTextarea();
        }
    });
});
