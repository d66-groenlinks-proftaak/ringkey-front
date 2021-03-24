import React from "react";
import {Button} from "primereact/button";
import {Sidebar} from 'primereact/sidebar';
import {InputText} from "primereact/inputtext";
import {Editor} from 'primereact/editor';
import {Dropdown} from "primereact/dropdown";
import {getAuthAuthenticated} from "../../../Core/Authentication/authentication.selectors";
import {connect} from "react-redux";

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPostOpen: false,
            additionalProps: {},
            newPost: {
                title: "",
                content: "",
                email: "",
                author: ""
            },
            invalidTitle: false,
            invalidContent: false,
            invalidEmail: false,
            invalidAuthor: false,
            currentMessages: 0
        }
    }

    setPostWindow = (open) => {
        this.setState({
            newPostOpen: open
        });
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    validateInput(type, content, cb) {
        if (content === undefined)
            return;

        if (type === "title") {
            if (content.length > 40) {
                this.setState({invalidTitle: "De titel is te lang"}, cb)
            } else if (content.length <= 5) {
                this.setState({invalidTitle: "De titel is te kort"}, cb)
            } else {
                this.setState({invalidTitle: false}, cb)
            }
        }

        if (type === "content") {
            if (content.length > 2000) {
                this.setState({invalidContent: "De tekst is te lang"}, cb)
            } else if (content.length <= 10) {
                this.setState({invalidContent: "De tekst is te kort"}, cb)
            } else {
                this.setState({invalidContent: false}, cb)
            }
        }
        if (type === "email") {
            if (this.validateEmail(content)) {
                this.setState({invalidEmail: false}, cb)
            } else {
                this.setState({invalidEmail: "Het email is ongeldig"}, cb)
            }
        }
        if (type === "author") {
            if (content.length > 50) {
                this.setState({invalidAuthor: "De naam is te lang"}, cb)
            } else if (content.length < 2) {
                this.setState({invalidAuthor: "De naam is te kort"}, cb)
            } else {
                this.setState({invalidAuthor: false}, cb)
            }
        }
    }

    onInputChanged = (type, content) => {
        this.validateInput(type, content)

        this.setState(oldState => {
            const newPost = oldState.newPost;
            newPost[type] = content;

            return {newPost}
        })
    }

    fullPost() {
        this.setState({
            additionalProps: {
                disabled: true,
                icon: "pi pi-spin pi-spinner"
            }
        })

        this.props.connection.send("CreateMessage", {
            Title: this.state.newPost.title,
            Content: this.state.newPost.content,
            Email: this.state.newPost.email,
            Author: this.state.newPost.author,
        })
            .then(result => {
                this.setState({
                    additionalProps: {}
                })

                this.setPostWindow(false);
            })
    }

    createPost() {
        this.validateInput("title", this.state.newPost.title, () => {
            this.validateInput("content", this.state.newPost.content, () => {
                this.validateInput("email", this.state.newPost.email, () => {
                    this.validateInput("author", this.state.newPost.author, () => {
                        if (this.props.loggedIn && !this.state.invalidTitle && !this.state.invalidContent) {
                            this.fullPost();
                        } else if (!this.state.invalidAuthor && !this.state.invalidEmail && !this.state.invalidTitle && !this.state.invalidContent) {
                            this.fullPost();
                        }
                    });
                });
            });
        });
    }

    setCurrentMessages(current) {
        console.log(current);
        this.setState({
            currentMessages: current
        })

        this.props.setLoaded(false);

        this.props.connection.send("RequestSortedList", current);
    }

    render() {

        let authenticated = <div>
            <h3>E-Mail</h3>
            <InputText style={{width: "100%"}} className={this.state.invalidEmail ? "p-invalid" : ""}
                       value={this.state.newPost.email} onChange={e => {
                this.onInputChanged("email", e.target.value)
            }}/>
            <div style={{color: "red"}}>{this.state.invalidEmail ? this.state.invalidEmail :
                <span>&nbsp;</span>}</div>

            <h3>Naam</h3>
            <InputText style={{width: "100%"}} className={this.state.invalidAuthor ? "p-invalid" : ""}
                       value={this.state.newPost.author} onChange={e => {
                this.onInputChanged("author", e.target.value)
            }}/>
            <div style={{color: "red"}}>{this.state.invalidAuthor ? this.state.invalidAuthor :
                <span>&nbsp;</span>}</div>
        </div>

        if (this.props.loggedIn)
            authenticated = "";

        const messageTypes = [
            {label: "Nieuwste", value: 0},
            {label: "Top", value: 1},
            {label: "Oudste", value: 2},
        ]

        const editorHeader = (
            <span id={"toolbar"}>
                <select className="ql-size">
                    <option className={"ql-small"} value="small"/>
                    <option selected/>
                    <option value="large"/>
                    <option value="huge"/>
                </select>
                <button className="ql-bold" aria-label="Bold"/>
                <button className="ql-italic" aria-label="Italic"/>
                <button className="ql-underline" aria-label="Underline"/>
                <button className="ql-blockquote" aria-label="Blockquote"/>
            </span>
        );

        return <div>

            <div className="p-d-flex p-jc-between p-ai-center" style={{marginBottom: 30, marginTop: 15}}>
                <div>
                    <Dropdown optionLabel={"label"} value={this.state.currentMessages} options={messageTypes}
                              onChange={(e) => this.setCurrentMessages(e.value)}/>
                </div>
                <div>
                    <Button onClick={() => {
                        this.setPostWindow(true)
                    }} label="Nieuw Bericht" style={{float: "right"}} icon="pi pi-plus" iconPos="right"/>
                </div>
            </div>

            <div className={"p-grid"}>
                <Sidebar className={"p-col-12 new-post p-grid p-justify-center p-nogutter"}
                         style={{overflowY: "scroll", overflowX: "hidden", width: "100%"}}
                         position="bottom"
                         showCloseIcon={false}
                         visible={this.state.newPostOpen} onHide={() => this.setPostWindow(false)}>
                    <div className="new-post-content p-p-3 p-pt-3">
                        <InputText style={{width: "100%"}} placeholder={"Titel"}
                                   className={this.state.invalidTitle ? "p-invalid" : ""}
                                   value={this.state.newPost.title} onChange={e => {
                            this.onInputChanged("title", e.target.value)
                        }}/>
                        <div style={{color: "red"}}>{this.state.invalidTitle ? this.state.invalidTitle :
                            <span>&nbsp;</span>}</div>

                        <Editor placeholder={"Typ hier uw bericht"} modules={{
                            toolbar: [[{'header': 1}, {'header': 2}], ['bold', 'italic'], ['link']]
                        }} className={this.state.invalidTitle ? "p-invalid" : ""}
                                style={{height: '250px'}}
                                value={this.state.newPost.content} onTextChange={(e) => {
                            console.log(e)
                            this.onInputChanged("content", e.htmlValue)
                        }}/>
                        <div style={{color: "red"}}>{this.state.invalidContent ? this.state.invalidContent :
                            <span>&nbsp;</span>}</div>


                        {authenticated}
                        <div>
                            <Button {...this.state.additionalProps} iconPos={"left"} icon={"pi pi-plus"}
                                    onClick={() => {
                                        this.createPost()
                                    }} label={"Plaatsen"}/>
                            <Button {...this.state.additionalProps}
                                    className={"p-button-secondary p-button-outlined p-ml-3"}
                                    iconPos={"right"}
                                    onClick={() => {
                                        this.setPostWindow(false)
                                    }} label={"Annuleren"}/>
                        </div>
                    </div>
                </Sidebar>
            </div>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {loggedIn: getAuthAuthenticated(state)}
}

export default connect(mapStateToProps)(Header);