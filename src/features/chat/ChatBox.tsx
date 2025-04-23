import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Container, Card, InputGroup, FormControl, Button, ListGroup } from "react-bootstrap";

//redux
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { messageAdded, ChatMessage } from 'features/chat/chat-slice';
import { MdOutlineSick } from "react-icons/md";
import { GiCaduceus } from "react-icons/gi";
import { FaCircle } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

export function ChatBox() {
    const [message, setMessage] = useState("");

    const dispatch = useAppDispatch();
    const userKind = useAppSelector((state) => state.user.userKind);
    
    const msgHistoryListGroup = useRef<HTMLDivElement>(null);

    function handleMessageChange(e: ChangeEvent) {
        setMessage((e.target as HTMLInputElement).value);
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            sendMessage();
        }
    }
    
    function sendMessage() {
        console.debug(`Adding ${userKind}'s message to store through dispatch ("${message}")`);

        const chatMessage : ChatMessage = {
            text: message,
            userKind: userKind
        }

        dispatch(messageAdded(chatMessage));

        const sentMessage = message;
        setMessage("");

        return sentMessage;
    }

    function scrollToBottom() {
        if (msgHistoryListGroup.current) {
            msgHistoryListGroup.current.scrollTop = msgHistoryListGroup.current.scrollHeight;
        }
    }

    const messages = useAppSelector((state) => state.chat.messages);

    // scroll to bottom when new message is added to the redux store
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    

    return (
        <Container>
            <Card>
                <Card.Header>Chat</Card.Header>
                <Card.Body>
                    <ListGroup className="mb-2" style={{ maxHeight: "20vh", overflowY: "scroll"}} ref={msgHistoryListGroup}>
                        {
                            // loop through messages stored in redux
                            useAppSelector((state) => state.chat.messages).map((msg, index) => {
                            // dispatch.chat.messages.map((msg, index )=> {
                                return (
                                    <ListGroup.Item key={index}>
                                        <span className="me-2" style={{ display: 'inline-block', position: 'relative' }}>
                                            { (msg.userKind === "patient") 
                                                ? <>
                                                    <FaCircle color="Blue" textAnchor="middle" alignmentBaseline="middle" 
                                                        style={{ fontSize: '1.8em' }}
                                                    />
                                                    <MdOutlineSick  color="white" textAnchor="middle"
                                                        alignmentBaseline="middle"
                                                        style={{ fontSize: '1.4em', position: 'absolute', left: '0.15em', bottom: '0.125em' }}
                                                    />
                                                </>
                                                : <>
                                                    <FaCircle color="Green" textAnchor="middle" alignmentBaseline="middle" 
                                                        style={{ fontSize: '1.8em' }}
                                                    />
                                                    <GiCaduceus color="white" textAnchor="middle"
                                                        alignmentBaseline="middle"
                                                        style={{ fontSize: '1.4em', position: 'absolute', left: '0.15em', bottom: '0.075em' }}
                                                    />
                                                </>
                                            }
                                        </span>
                                        {msg.text}
                                    </ListGroup.Item>
                                );
                            })
                        }
                    </ListGroup>

                    <InputGroup className="mb-3">
                        <FormControl
                            placeholder="Type your message here"
                            aria-label="Message"
                            aria-describedby="basic-addon2"
                            value={message}
                            onChange={handleMessageChange}
                            onKeyDown={handleKeyDown}
                        />
                        <Button variant="primary" id="submitMessageBtn" onClick={sendMessage}>
                            <IoSend></IoSend>
                        </Button>
                    </InputGroup>
                </Card.Body>
            </Card>
        </Container>
    );
}