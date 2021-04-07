import ShadowBanMessage from "./ShadowBanMessage";
import React, {useEffect, useRef, useState} from "react";
import {getAuthAuthenticating, getAuthError} from "../../../Core/Authentication/authentication.selectors";
import {getGlobalConnection} from "../../../Core/Global/global.selectors";
import {connect} from "react-redux";
import { Toast } from 'primereact/toast';



function ShadowBans(props){
    const [messageList, setMessageList] = useState();
    const toast = useRef(null);

    useEffect(() =>{
        props.connection.on("ConfirmBannedMessageUpdate", confirm =>{
            if(confirm === 0)
            {
                toast.current.show({severity:'error', summary: 'Bericht verwijderd', life: 3000});
            }else{
                toast.current.show({severity:'success', summary: 'Bericht toegestaan', life: 3000});
            }


        })
        props.connection.on("SendShadowBannedMessages", message =>{
            setMessageList(message)
        })
        return function cleanup(){
            props.connection.off("SendShadowBannedMessages")
            props.connection.off("ConfirmBannedMessageUpdate")
        }
    })

    useEffect( () =>{
        props.connection.send("GetShadowBannedMessages")
    })

    return <div style={{width: "100%"}} className={"p-d-flex p-jc-center p-ai-center"}>
        <Toast ref={toast} />
        <div style={{width: "40%"}}>
            <h1 style={{textAlign: "center"}}>Gerapporteerde berichten</h1>
            <h4 style={{textAlign: "center"}}><i className={"pi pi-ban"}/> : Verwijdert dit bericht <i className={"pi pi-check"}/> : Sta dit bericht toe</h4>
            {messageList !== undefined && messageList[0] !== undefined ? messageList.map(message => {
                return <ShadowBanMessage style={{width: "100%"}} guest={message.guest}
                                         replies={message.replies}
                                         pinned={message.pinned}
                                         title={message.title}
                                         authorId={message.authorId}
                                         author={message.author}
                                         created={message.created}
                                         postId={message.id}>
                    {message.content.replace(/<[^>]*>?/gm, '').substring(0, 600)}
                </ShadowBanMessage>

            }) :  <h2 style={{textAlign: "center"}}>Er zijn geen gerapporteerde berichten gevonden</h2> }
        </div>

    </div>
}
const mapStateToProps = (state) => {
    return {error: getAuthError(state), loggingIn: getAuthAuthenticating(state), connection: getGlobalConnection(state)}
}
export default connect(mapStateToProps)(ShadowBans)