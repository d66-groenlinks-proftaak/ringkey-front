import React, {useEffect, useState} from "react";
import {Sidebar} from "primereact/sidebar";
import LoadingMessage from "./LoadingMessage";
import {Menu} from "primereact/menu";
import {Divider} from "primereact/divider";
import {Dialog} from 'primereact/dialog';
import {Tooltip} from 'primereact/tooltip';
import {ScrollTop} from 'primereact/scrolltop';
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";

import {Editor} from "primereact/editor";
import Report from "./Report";
import {getAuthAuthenticated, getAuthId} from "../../../Core/Authentication/authentication.selectors";
import {connect} from "react-redux";
import {WindowScroller} from "react-virtualized";
import Replies from "./Replies";
import Thread from "./Thread";
import Header from "./Header";
import CreateReply from "./CreateReply";
import {setReplyOpen, setReplyingToId, setReplyingTo, setReplies} from "../../../Core/Message/message.actions";
import {getReplyOpen} from "../../../Core/Message/message.selectors";

import {FileUpload} from "primereact/fileupload";
import {getPermissions} from "../../../Core/Global/global.selectors";
import {toHtml} from "@fortawesome/fontawesome-svg-core";
import Webinar from "./Webinar";

function Message(props) {
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");
    const [created, setCreated] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [id, setId] = useState("");
    const [locked, setLocked] = useState(true);
    const [rating, setRating] = useState("");
    const [userRating, setUserRating] = useState("");
    const [title, setTitle] = useState("");
    const [newReportOpen, setNewReportOpen] = useState(false);
    const [reportId, setReportId] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [showAttachmentState, setShowAttachment] = useState(false);
    const [attachment, setAttachment] = useState("");
    const [webinar, setWebinar] = useState(false);

    const [editWindow, setEditWindow] = useState(false);
    const [invalidContent, setInvalidContent] = useState(false);
    const [invalidTitle, setInvalidTitle] = useState(false);
    const [additionalProps, setAdditionalProps] = useState({});
    const [editMessageContent, setEditMessageContent] = useState(content);
    const [editMessageTitle, setEditMessageTitle] = useState(title);

    const [type, setType] = useState(0);

    const menuRef = React.createRef();

    const [extraOptions, setExtraOptions] = useState([{
        label: "Rapporteer",
        icon: "pi pi-ban",
        command: () => {
            setReportWindow(true);
        }
    }
    ]);

    const setAnnouncement = () =>{
        if(props.permissions.includes(4) && type === 0){
            let oldOptions = extraOptions;
            oldOptions.push({
                label: "Mededeling",
                icon: "pi pi-volume-off",
                command: () => {
                    props.connection.send("SetAnnouncement", props.id);
                }
            });
            setExtraOptions(oldOptions);
        }


    }
    const showAttachment = (bool, url) => {
        setShowAttachment(bool);
        setAttachment(url)
    }

    const setPostWindow = (open) => {
        props.dispatch(setReplyOpen(open));
    }

    const togglePostWindow = () => {
        props.dispatch(setReplyOpen(!props.replyOpen));
    }

    const setReportWindow = (open) => {
        setNewReportOpen(open);
    }

    const setReplyState = (author, id) => {
        props.dispatch(setReplyingToId(id));
        props.dispatch(setReplyingTo(author));
    }

    const onHide = () => {
        setShowAttachment(false);
    }

    const onInputChanged = (type, c) => {
        validateInput(type, c)

        if(type === "content"){
            setEditMessageContent(c)
        }
        else if (type === "title"){

            setEditMessageTitle(c)
        }

    }

    const validateInput = (type, c) => {
        if (type === "title") {
            if (c.length > 40) {
                setInvalidTitle("De title is te lang")
            } else if (c.length <= 5) {
                setInvalidTitle("De titel is te kort")
            } else {
                setInvalidTitle(false)
            }
        }

        if (type === "content") {
            if (c.length > 2000) {
                setInvalidContent("De tekst is te lang")
            } else if (c.length <= 10) {
                setInvalidContent("De tekst is te kort")
            } else {
                setInvalidContent(false)
            }
        }
    }

    const createPost = () => {
        validateInput("title", editMessageTitle)
        validateInput("content", editMessageContent)

        if (props.loggedIn && !invalidTitle&& !invalidContent) {
            props.connection.send("EditMessage",{
                MessageId: id,
                Title: editMessageTitle,
                Content: editMessageContent
            })
            setEditWindow(false)
            window.location.reload();
        }
    }

    useEffect(() => {
        props.connection.on("SendThreadDetails", thread => {
            console.log(thread)
            setAuthor(thread.parent.author);
            setContent(thread.parent.content);
            setCreated(thread.parent.created);
            setId(thread.parent.id);
            setTitle(thread.parent.title);
            setUserRating(thread.parent.userRating);
            setAuthorId(thread.parent.authorId);
            setAttachments(thread.parent.attachments || []);
            setLocked(thread.parent.locked);
            setRating(thread.parent.rating);
            setEditMessageContent(thread.parent.content);
            setEditMessageTitle(thread.parent.title)
            setWebinar(thread.parent.webinar)
            setType(thread.parent.type);
            if(thread.parent.authorId === props.accountId){
                extraOptions.push({
                    label: "Bewerken",
                    icon: "pi pi-pencil",
                    command: () => {
                        setEditWindow(true)
                    }
                },)
            }

            props.dispatch(setReplies(thread.children));
        })
        setAnnouncement();
        props.connection.send("LoadMessageThread", props.id);

        return function cleanup() {
            props.connection.off("SendThreadDetails");
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (title === "") {
        return <div className={"p-mt-5"}>
            <Header/>
            <LoadingMessage/>
        </div>
    }

    return <div className={"p-mt-5"} id={"Message"}>
        <Menu ref={menuRef} popup model={extraOptions}/>

        <Header/>

        <Sidebar className={"p-col-12 new-post p-grid p-justify-center p-nogutter"}
                 style={{overflowY: "scroll", overflowX: "hidden", width: "100%"}}
                 position="bottom"
                 showCloseIcon={false}
                 visible={editWindow} onHide={() => setEditWindow(false)}>
            <div className="new-post-content p-p-3 p-pt-3">
                <InputText style={{width: "100%"}} placeholder={"Titel"}
                           className={invalidTitle ? "p-invalid" : ""}
                           value={editMessageTitle} onChange={e => {
                    onInputChanged("title", e.target.value)
                }}/>
                <div style={{color: "red"}}>{invalidTitle ? invalidTitle :
                    <span>&nbsp;</span>}</div>

                <Editor placeholder={"Typ hier uw bericht"} modules={{
                    toolbar: [[{'header': 1}, {'header': 2}], ['bold', 'italic'], ['link']]
                }} className={invalidContent ? "p-invalid" : ""}
                        style={{height: '250px'}}
                        value={editMessageContent} onTextChange={(e) => {
                    onInputChanged("content", e.htmlValue)
                }}/>

                <div style={{color: "red"}}>{invalidContent ? invalidContent:
                    <span>&nbsp;</span>}</div>

                <div>
                    <Button {...additionalProps} iconPos={"left"} icon={"pi pi-plus"}
                            onClick={() => {
                                createPost()
                            }} label={"bewerken"}/>
                    <Button {...additionalProps}
                            className={"p-button-secondary p-button-outlined p-ml-3"}
                            iconPos={"right"}
                            onClick={() => {
                                setEditWindow(false)
                            }} label={"Annuleren"}/>
                </div>
            </div>
        </Sidebar>
        {webinar ? <Webinar
                title={title}
                author={author}
                authorId={authorId}
                id={"Webinar"}
                Content={content}
                setReplyingTo={setReplyState}
                togglePostWindow={togglePostWindow}
            />
            :
            <Thread togglePostWindow={togglePostWindow}
                    attachments={attachments}
                    showAttachment={(a) => {showAttachment(true, a)}} id={id}
                    created={created}
                    title={title} menuRef={menuRef}
                    setReplyingTo={setReplyState}
                    setReportId={setReportId}
                    author={author} authorId={authorId} content={content} isThread={true}
                    locked={locked} rating={rating} userRating={userRating}/>}


        <Divider align="left">
            <span className="p-tag"
                  style={{
                      backgroundColor: "transparent",
                      border: "1px solid #dee2e6",
                      color: "#49506c",
                      fontSize: "1.2em",
                      fontWeight: "normal"
                  }}>Reacties</span>
        </Divider>


        <CreateReply id={id}/>

        <Sidebar visible={newReportOpen} style={{overflowY: "scroll"}}
                 className={"p-col-12 p-md-4"}
                 onHide={() => props.setReportWindow(false)} position="right">
            <Report id={reportId} connection={props.connection}
                    setReportWindow={setReportWindow}/>
        </Sidebar>

        <div>
            <WindowScroller scrollElement={window}>
                {({height, isScrolling, onChildScroll, scrollTop}) => (
                    <Replies id={id}
                             setPostWindow={setPostWindow} menuRef={menuRef}
                             setReportId={setReportId}
                             setReplyingTo={setReplyState}
                             connection={props.connection} height={height}
                             isScrolling={isScrolling}
                             onChilScroll={onChildScroll}
                             scrollTop={scrollTop}/>
                )}
            </WindowScroller>
        </div>

        <Dialog breakpoints={{'960px': '75vw', '640px': '100vw'}} dismissableMask={true} keepInViewport={true}
                header="Bijlage" visible={showAttachmentState} onHide={() => {
            onHide();
        }}>
            <img src={attachment} alt="Bijlage" style={{width: "100%", maxHeight: "100%"}}/>
        </Dialog>

        <Tooltip className={"tooltip"} target=".message-posted" position={"bottom"}/>
        <ScrollTop/>
    </div>
}

const mapStateToProps = (state) => {
        return {loggedIn: getAuthAuthenticated(state),
            replyOpen: getReplyOpen(state),
            permissions: getPermissions(state),
            accountId: getAuthId(state) }
    }

export default connect(mapStateToProps)

(
    Message
)
