import {Link} from "react-router-dom";
import {DateTime} from "luxon";
import {Menu} from "primereact/menu";
import {Button} from "primereact/button";
import {Card} from "primereact/card";
import React from "react";

function Reply(props) {

    return <div
        className={props.level > 0 ? "post-child" : ""}
        style={{
            paddingLeft: (props.level) * 30,
            margin: 0,
            paddingTop: 10
        }}>
        <Card
            className={props.level > 0 ? "" : "post-parent"}
            subTitle={<span><Link to={"/profile/" + props.authorId}
                                  style={{
                                      color: "blue",
                                  }}>@{props.author}</Link></span>}>
            <div dangerouslySetInnerHTML={{__html: props.content}}/>

            <div className="p-d-flex p-jc-between p-ai-center">
                <div className={"message-posted"}
                     data-pr-tooltip={DateTime.fromMillis(props.created).setLocale("nl").toLocaleString(DateTime.DATETIME_FULL)}>
                    {DateTime.fromMillis(props.created).toRelative({locale: "nl"})}
                </div>
                <div>
                    <Menu ref={props.menuRef} popup model={props.extraOptions}/>

                    <Button className={"p-button-secondary p-mr-2 p-button-text"} icon="pi pi-ellipsis-h"
                            iconPos="right"
                            onClick={(event) => {
                                if (props.menuRef.current)
                                    props.menuRef.current.toggle(event)
                                props.setReportId(props.id)
                            }}/>

                    {props.level === undefined ? <Button onClick={() => {
                        props.setPostWindow(true)
                        props.setReplyingTo(props.author, props.id)
                    }} className={"p-button-primary p-button-outlined"} icon="pi pi-plus" label={"Citeer"}
                                                         iconPos="right"/> : ""}
                </div>
            </div>
        </Card>
    </div>
}

export default Reply;
