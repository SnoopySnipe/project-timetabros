const styles = (theme => ({
    card: {
        padding: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '5%',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(2),
    },
    submit: {
        margin: theme.spacing(2, 0),
    },
    cardContainer: {
        paddingTop: theme.spacing(8),
    },
    alert: {
        marginBottom: theme.spacing(2),
    }
}));

export default styles;