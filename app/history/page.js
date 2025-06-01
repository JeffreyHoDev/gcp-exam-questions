'use client'
import styles from "./historylistpage.module.css";
import Link from 'next/link'

import { useEffect, useState } from 'react';
import clsx from 'clsx';


export default function HistoryListPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const [isLogin , setIsLogin] = useState(false);
    const [loginIdentity, setLoginIdentity] = useState('');
    const [loginID, setLoginID] = useState('');
    const [historyList, setHistoryList] = useState([]);
    const [historyListLoading, setHistoryListLoading] = useState(false);

    const [registerIdentifier, setRegisterIdentifier] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    useEffect(() => {
        const handleUnload = () => {
            sessionStorage.removeItem('historyList');
            sessionStorage.removeItem('loginIdentity');
            sessionStorage.removeItem('loginID');
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    const register = async () => {
        setIsRegistering(true);
        try {
            const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND}/register_identifier`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: registerIdentifier,
                    registerEmail: registerEmail
                }),
            })
            const data = await response.json();
            if (data.message === "Identifier registered successfully"){
                setIsRegistering(false);
                alert(`Identifier ${registerIdentifier} registered successfully. You may try to login now`);
                setRegisterIdentifier('');
                setRegisterEmail('');
            }else {
                setIsRegistering(false);
                alert(`Error registering identifier`);
            }

        }catch(err) {
            setIsRegistering(false);
            console.error('Error registering identifier:', err);
        }
    }

    const login = async () => {
        setIsLoggingIn(true);
        try {
            const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: loginIdentifier
                }),
            });
            const data = await response.json();
            if (data.error) {
                alert(data.error);
            } else {
                setLoginIdentity(data.details.identifier);
                setLoginID(data.details.id);
                setIsLoggingIn(false);
                setIsLogin(true);
                sessionStorage.setItem('loginIdentity', data.details.identifier);
                sessionStorage.setItem('loginID', data.details.id);
            }
        } catch (err) {
            console.error('Error logging in:', err);
        } finally {
            setIsLoggingIn(false);
        }
    }

    useEffect(() => {
        // Restore login info
        const storedIdentity = sessionStorage.getItem('loginIdentity');
        const storedID = sessionStorage.getItem('loginID');
        if (storedIdentity && storedID) {
            setLoginIdentity(storedIdentity);
            setLoginID(storedID);
            setIsLogin(true);
        }

        // Restore history list
        const storedHistory = sessionStorage.getItem('historyList');
        if (storedHistory) {
            setHistoryList(JSON.parse(storedHistory));
        }
    }, []);

    useEffect(() => {
        
        const getHistoryList = async () => {
            try {
                const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND}/get_history_list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        identifier: loginIdentity
                    }),
                });
                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                } else {
                    setHistoryList(data);
                    setHistoryListLoading(false);
                    sessionStorage.setItem('historyList', JSON.stringify(data));
                }
            } catch (err) {
                console.error('Error fetching history list:', err);
                setHistoryListLoading(false);
            }
        }
        
        if(isLogin){
            setHistoryListLoading(true);
            getHistoryList();
        }
    }, [isLogin])


  
    return (
        <div className={styles.historyListPage}>
            <Link href="/" className={styles.backHomeLink}>Back to Home</Link>
            <div>
                <h1 className={styles.title}>History (Saved Questions)</h1>
            </div>
            {
                isLogin ? (
                    <div className={styles.historyListSection}>
                        {
                            historyListLoading ? (
                                <div className={styles.loadingText}>Loading...</div>
                            ) : (
                                <div className={styles.historyListContainer}>
                                    <h2 className={styles.historyListTitle}>History List for <span className={styles.identifier}>{loginIdentity}</span></h2>
                                    <p className={styles.historyInfo}>If can&apos;t find the history you have saved, try refresh the page and login again</p>
                                    <div className={styles.historyList}>
                                        {historyList.length === 0 ? (
                                            <div>No history found.</div>
                                        ) : (
                                            historyList.map((item, index) => (
                                            <div className={styles.historyCard} key={item.id}>
                                                <div className={styles.historyCardTime}>
                                                {new Date(item.saved_time).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Singapore' })}
                                                </div>
                                                <Link
                                                    className={styles.historyCardLink}
                                                    href={`/history/${loginIdentity}/${item.id}`}
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )
                        }

                        
                    </div>
                ) : (
                    <div className={styles.notLoginSection}>
                        <h2 className={styles.notLoginText}>You haven&apos;t login. Please provide your unique identifier to view your saved history</h2>
                        <div className={styles.loginInputSection}>
                            {mounted && <input className={styles.loginInput} placeholder="Identifier*" onChange={(e) => setLoginIdentifier(e.target.value)} value={loginIdentifier}/>}
                            
                            <button onClick={login} disabled={isRegistering || loginIdentifier.length === 0} className={clsx(styles.loginBtn, loginIdentifier.length === 0 && styles.disableBtn)}>Login</button>
                        </div>
                        <div className={styles.registerSection}>
                            <h3 className={styles.registerText}>If you don&apos;t have an identifier created before, please register first</h3>
                            <ul className={styles.registerNotes}>
                                <li className={styles.registerNoteItem}>Create a unique identifier, you will reuse it to store your history questions</li>
                                <li className={styles.registerNoteItem}>Use the created identifier to login in the future</li>
                                <li className={styles.registerNoteItem}>Please be aware anyone with your identifier will be able to see your history questions, since we didn&apos;t request password for verification</li>
                                <li className={styles.registerNoteItem}>An email will be sent if you provide a valid email address</li>
                            </ul>
                            <div className={styles.registerInputSection}>
                                <div className={styles.registerInputFieldsGroup}>
                                    {mounted && <input className={styles.registerInput} onChange={(e) => setRegisterIdentifier(e.target.value)}  placeholder="Identifier*" value={registerIdentifier}/>}
                                    {mounted && <input className={styles.registerInput} placeholder="Email (Optional)" onChange={(e) => setRegisterEmail(e.target.value)} type="email" value={registerEmail}/>  }
                    
                                </div>
                                <button disabled={registerIdentifier.length === 0 || isRegistering ? true : false} className={clsx(styles.registerBtn, registerIdentifier.length === 0 && styles.disableBtn)} onClick={register}>Register</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
