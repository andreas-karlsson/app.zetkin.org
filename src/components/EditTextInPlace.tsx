import Alert from '@material-ui/lab/Alert';
import { useIntl } from 'react-intl';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ClickAwayListener, InputBase, Snackbar, Tooltip } from '@material-ui/core';
import { lighten, makeStyles } from '@material-ui/core/styles';

interface ComponentProps {
    defaultText: string;
    label: string;
    onSubmit: (arg: string) => Promise<boolean>;
    text: string;
}

const useStyles = makeStyles((theme) => ({
    input: {
        '&:focus, &:hover': {
            borderColor: lighten(theme.palette.primary.main, 0.75 ),
            paddingLeft: 10,
            paddingRight: 0,
        },
        border: '2px dashed transparent',
        borderRadius: 10,
        paddingRight: 10,
        transition: 'all 0.2s ease',
    },
    inputRoot: {
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 'inherit !important',
        fontWeight: 'inherit',
    },
}));


const EditTextinPlace: React.FunctionComponent<ComponentProps> = ({ label, text, onSubmit, defaultText }) => {
    const [editing, setEditing] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState<'success' | 'error'>();
    const [newText, setNewText] = useState<string>(text);
    const classes = useStyles();
    const inputRef = useRef<HTMLInputElement>(null);
    const intl = useIntl();

    const intlIds = {
        alert: `misc.components.editTextInPlace.alert.${snackbar || 'error'}`,
        tooltip: `misc.components.editTextInPlace.tooltip.${editing ? 'save' : 'edit'}`,
    };

    useEffect(() => {
        if (text !== newText) setNewText(text);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);

    const onRequestEdit = () => {
        setEditing(true);
        if (text === defaultText) setNewText('');
    };
    const onCancelEdit = () => {
        setEditing(false);
        setNewText(text);
    };
    const onChange = (evt: ChangeEvent<HTMLInputElement> ) => {
        setNewText(evt.target.value);
    };
    const onKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.key === 'Enter') {
            if (!newText) submitChange(defaultText);
            else if ( newText && newText !== text) submitChange();
        }
    };
    const submitChange = (override?: string) => {
        inputRef?.current?.blur();
        setEditing(false);
        setDisabled(true);
        onSubmit(override || newText).then((success) => {
            setSnackbar(success ? 'success' : 'error');
            setDisabled(false);
        });

    };

    return (
        <>
            <Snackbar
                anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                autoHideDuration={ 3000 }
                onClose={ () => setSnackbar(undefined) }
                open={ !!snackbar }>
                <Alert onClose={ () => setSnackbar(undefined) } severity={ snackbar }>
                    { snackbar && intl.formatMessage({ id: intlIds.alert },{ label }) }
                </Alert>
            </Snackbar>
            <Tooltip title={ intl.formatMessage({ id: intlIds.tooltip },{ label }) }>
                <ClickAwayListener onClickAway={ onCancelEdit }>
                    <InputBase
                        classes={{ input: classes.input, root: classes.inputRoot  }}
                        disabled={ disabled }
                        inputProps={{ size: Math.max(5, newText?.length) }}
                        inputRef={ inputRef }
                        onChange={ onChange }
                        onFocus={ onRequestEdit }
                        onKeyDown={ onKeyDown }
                        readOnly={ !editing }
                        value={ newText }
                    />
                </ClickAwayListener>
            </Tooltip>
        </>);
};

export default EditTextinPlace;
