import books from '../../img/books.jpg';

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
    bgContainer: {
        minHeight: '100vh',
        backgroundImage: `linear-gradient(to bottom, rgba(245, 246, 252, 0.70), rgba(117, 19, 93, 0.90)), url(${books})`,
        backgroundSize: 'cover',
    },
    cardContainer: {
        paddingTop: theme.spacing(8),
    },
    container: {
        minHeight: '100vh',
    }
}));

export default styles;