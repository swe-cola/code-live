const animals = [
'Alligator', 'Anteater', 'Armadillo', 'Auroch', 'Axolotl', 'Badger', 'Bat', 'Bear', 'Beaver',
'Blobfish', 'Buffalo', 'Camel', 'Chameleon', 'Cheetah', 'Chipmunk', 'Chinchilla', 'Chupacabra',
'Cormorant', 'Coyote', 'Crow', 'Dingo', 'Dinosaur', 'Dog', 'Dolphin', 'Dragon',
'Duck', 'Dumbo octopus', 'Elephant', 'Ferret', 'Fox', 'Frog', 'Giraffe', 'Goose',
'Gopher', 'Grizzly', 'Hamster', 'Hedgehog', 'Hippo', 'Hyena', 'Jackal', 'Jackalope',
'Ibex', 'Ifrit', 'Iguana', 'Kangaroo', 'Kiwi', 'Koala', 'Kraken', 'Lemur',
'Leopard', 'Liger', 'Lion', 'Llama', 'Manatee', 'Mink', 'Monkey', 'Moose',
'Narwhal', 'Nyan cat', 'Orangutan', 'Otter', 'Panda', 'Penguin', 'Platypus', 'Python',
'Pumpkin', 'Quagga', 'Quokka', 'Rabbit', 'Raccoon', 'Rhino', 'Sheep', 'Shrew',
'Skunk', 'Slow loris', 'Squirrel', 'Tiger', 'Turtle', 'Unicorn', 'Walrus', 'Wolf',
'Wolverine', 'Wombat'
]
/**
 * Inspired by https://dororongju.tistory.com/151
 */
class Chat {
    constructor() {
        this.myId = getCookie(CODE_LIVE_COOKIE);
        this.docId = `${collection}-${documentName}`;
        this.myName = `Anonymous ${this.getName.call(this)}`;

        this.lastSender = undefined;
        this.init = false;

        this.socket = io(`${CHAT_SERVER_HOST}:${CHAT_SERVER_PORT}`);
        this.socket.emit('chat-register', {
            docId: this.docId,
            senderName: this.myName,
            senderId: this.myId,
            message: '',
        });
        this.socket.on('chat-message', (msg) => {
            this.receive(msg);
        })

        this.createMessageTag = this.createMessageTag.bind(this);
        this.appendMessageTag = this.appendMessageTag.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.clearTextarea = this.clearTextarea.bind(this);
        this.receive = this.receive.bind(this);
    }

    getName() {
        const idx = this.__hash() % animals.length;
        return animals[idx];
    }

    __hash() {
        const toHash = this.docId + this.myId;
        let hash = 0;
        for (let i = 0; i < toHash.length; i++) {
            const chr = toHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
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
          nameElem.text((senderName === this.myName) ? 'Me' : senderName);
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
            senderName: this.myName,
            senderId: this.myId,
            message: message,
        };
        this.socket.emit('chat-message', data);
    }

    clearTextarea() {
        $('div.input-div textarea').val('');
    }

    receive(data) {
        const LR = (data.senderName !== this.myName) ? 'left' : 'right';
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
