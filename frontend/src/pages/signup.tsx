import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { login } from "../utils/auth";
import Router from "next/router";
import { config } from "../config";

const INPUT_STYLE = "bg-gray-200 placeholder-gray-700 text-lg text-md my-2 p-2";

export default function Signup() {
    const { watch, handleSubmit, register, errors } = useForm();
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const onSubmit = async (values: {
        email: string;
        password: string;
        password2: string;
        firstname: string;
        lastname: string;
    }) => {
        setFetching(true);
        try {
            const resp = await fetch(`http://${config.endpoint}/signup`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(values).toString(),
            });
            if (resp.status === 400)
                setMessage((await resp.json())?.message || "internal error");
            else {
                setMessage(null);
                // TODO check if the response contains a token
                const { token } = await resp.json();
                login(token);
                Router.push("/dashboard");
            }
        } finally {
            setFetching(false);
        }
    };

    const errorMessages = [
        message,
        errors.email && errors.email.message,
        errors.password && errors.password.message,
        errors.password2 && errors.password2.message,
    ]
        .filter((value) => !!value)
        .map((value) => <span key={value}>{value}</span>);

    return (
        <div className="w-full h-full py-10 min-h-screen">
            <div className="mx-auto container">
                <div className="mx-auto w-5/6 md:w-7/12 lg:w-7/12 xl:w-1/2">
                    <div className="flex items-baseline px-4 mb-4">
                        <h1 className="text-3xl font-semibold text-gray-700">
                            Make A New Account
                        </h1>
                    </div>
                    <form
                        className="flex flex-col rounded-t-lg p-4 bg-white"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <input
                            className={INPUT_STYLE}
                            type="email"
                            name="email"
                            required
                            placeholder="your email"
                            ref={register({
                                required: true,
                                pattern: {
                                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                    message: "must be a valid email",
                                },
                            })}
                        />
                        <div className="grid grid-cols-2 col-gap-6">
                            <input
                                className={
                                    INPUT_STYLE +
                                    " flex-grow col-span-2 lg:col-span-1"
                                }
                                type="text"
                                required
                                name="firstname"
                                placeholder="your first name"
                                ref={register({ required: true })}
                            />
                            <input
                                className={
                                    INPUT_STYLE +
                                    " flex-grow col-span-2 lg:col-span-1"
                                }
                                type="text"
                                required
                                name="lastname"
                                placeholder="your last name"
                                ref={register({
                                    required: true,
                                })}
                            />
                        </div>
                        <input
                            className={INPUT_STYLE}
                            type="password"
                            name="password"
                            placeholder="******"
                            required
                            ref={register({
                                minLength: {
                                    value: 8,
                                    message:
                                        "password must be at least 8 characters",
                                },
                                maxLength: {
                                    value: 24,
                                    message:
                                        "password must be at most 8 characters",
                                },
                                required: true,
                            })}
                        />
                        <input
                            className={INPUT_STYLE}
                            type="password"
                            name="password2"
                            placeholder="******"
                            required
                            ref={register({
                                required: true,
                                validate: (val) =>
                                    val === watch("password") ||
                                    "passwords must match",
                            })}
                        />
                        <div className="flex items-baseline pt-4">
                            {!fetching ? (
                                <button className="rounded inline-block bg-blue-600 text-white text-lg text-md p-2 px-4 mr-4">
                                    Signup
                                </button>
                            ) : (
                                <div className="rounded inline-block bg-gray-600 text-white text-lg text-md p-2 px-4 mr-4">
                                    Loading
                                </div>
                            )}
                            <Link href="/login">
                                <a className="font-bold">Or Login</a>
                            </Link>
                        </div>
                    </form>
                    <div className="grid grid-cols-1 row-gap-2 justify-between text-red-700 rounded-b-lg p-4 bg-gray-200">
                        {errorMessages}
                    </div>
                </div>
            </div>
        </div>
    );
}
