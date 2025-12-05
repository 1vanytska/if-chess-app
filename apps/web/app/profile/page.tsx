"use client";

import { useState, useEffect, useTransition } from 'react';
import { Button, Stack, Typography, Box, TextField, Alert } from '@mui/material';
import { useActionState } from 'react';
import { confirm2FA, disable2FA, enable2FA } from './twofa-actions';
import { get } from '../common/util/fetch';

interface CurrentUser {
    id: number;
    email: string;
    twoFAEnabled: boolean;
}

interface TwoFAState {
    error: string;
    data?: {
        qrCodeDataUrl?: string;
        secret?: string;
    };
    success?: boolean;
}

export default function ProfileSettingsPage() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [setupState, setSetupState] = useState<'IDLE' | 'GENERATED' | 'VERIFIED'>('IDLE');
    const [disableError, setDisableError] = useState<string>('');
    
    const [isDisabling, startDisableTransition] = useTransition(); 

    const [enableState, formEnableAction] = useActionState<TwoFAState, FormData>(enable2FA, { error: "" });
    const [confirmState, formConfirmAction] = useActionState<TwoFAState, FormData>(confirm2FA, { error: "" });

    useEffect(() => {
        if (enableState.data?.qrCodeDataUrl) {
            setQrCodeUrl(enableState.data.qrCodeDataUrl);
            setSetupState('GENERATED');
        }
        if (confirmState.success) {
            setSetupState('VERIFIED');
            setQrCodeUrl(''); 
        }
    }, [enableState, confirmState]);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await get('users/me'); 
            if (res && !res.error) {
                setUser(res as CurrentUser);
                if ((res as CurrentUser).twoFAEnabled) {
                    setSetupState('VERIFIED');
                } else {
                    setSetupState('IDLE');
                }
            }
            setLoading(false);
        };
        if (confirmState.success || !isDisabling) { 
            setDisableError('');
        }
        fetchUser();
    }, [confirmState, isDisabling]);

    const handleDisable = (formData: FormData) => {
        setDisableError('');
        startDisableTransition(async () => {
            const result = await disable2FA({ error: "" }, formData);
            if (result.error) {
                setDisableError(result.error);
            }
        });
    };


    if (loading || !user) return <Typography>Завантаження налаштувань...</Typography>;

    const is2faEnabled = (user.twoFAEnabled && setupState !== 'GENERATED') || setupState === 'VERIFIED';
    
    const renderSetupUI = () => {
        if (is2faEnabled) {
            return (
                <Stack spacing={2}>
                    <Alert severity="success">Двофакторна аутентифікація активована!</Alert>
                    {disableError && <Alert severity="error">{disableError}</Alert>}
                    <form action={handleDisable}> 
                        <Button 
                            variant="outlined" 
                            color="error" 
                            type="submit" 
                            disabled={isDisabling}
                        >
                            {isDisabling ? 'Вимкнення...' : 'Вимкнути 2FA'}
                        </Button>
                    </form>
                </Stack>
            );
        }

        if (setupState === 'GENERATED' && qrCodeUrl) {
            return (
                <form action={formConfirmAction}> 
                    <Stack spacing={2} alignItems="center">
                        <Typography variant="subtitle1">Крок 2: Підтвердження коду</Typography>
                        <img src={qrCodeUrl} alt="QR Code" style={{ border: '1px solid #ccc', padding: '10px' }} />
                        <Typography variant="body2" align="center">
                            Скануйте код додатком та введіть код:
                        </Typography>
                        <TextField 
                            error={!!confirmState.error} 
                            helperText={confirmState.error} 
                            name="code" 
                            label="6-значний код" 
                            variant="outlined" 
                        />
                        <Button type="submit" variant="contained">Підтвердити активацію</Button>
                    </Stack>
                </form>
            );
        }
        
        return (
            <form action={formEnableAction}> 
                <Button type="submit" variant="contained" color="primary">Увімкнути 2FA</Button>
            </form>
        );
    };

    return (
        <Box sx={{ maxWidth: 400, margin: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>Налаштування безпеки</Typography>
            <Typography variant="h6" gutterBottom>Двофакторна аутентифікація (2FA)</Typography>
            {(enableState.error || confirmState.error) && <Alert severity="error">{enableState.error || confirmState.error}</Alert>}
            {renderSetupUI()}
        </Box>
    );
}