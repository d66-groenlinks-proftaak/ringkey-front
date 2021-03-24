export const Actions = {
    setConnection: "[Global] Connection",
    setDarkMode: "[Global] Dark Mode",
}

export const setConnection = (connection) => ({
    type: Actions.setConnection,
    payload: {
        connection
    }
})

export const setDarkMode = (darkmode) => {
    return function (dispatch) {
        localStorage.setItem("dark", (darkmode) ? "0" : "1");

        dispatch(setDarkModeInternal(darkmode))
    }
}

const setDarkModeInternal = (darkmode) => ({
    type: Actions.setDarkMode,
    payload: {
        darkmode
    }
})