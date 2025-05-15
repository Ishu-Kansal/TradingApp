--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2025-05-14 23:30:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 24816)
-- Name: PaperTrading; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "PaperTrading";


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 24855)
-- Name: OptionsData; Type: TABLE; Schema: PaperTrading; Owner: -
--

CREATE TABLE "PaperTrading"."OptionsData" (
    "contractSymbol" character varying(25) NOT NULL,
    "lastTradeDate" character varying(100),
    strike numeric(8,2) DEFAULT '-1'::integer NOT NULL,
    "lastPrice" numeric(8,2),
    volume integer,
    "openInterest" integer,
    "impliedVolatility" numeric(5,3),
    delta numeric(5,4),
    gamma numeric(5,4),
    theta numeric(5,3),
    rho numeric(5,4),
    vega numeric(5,4)
);


--
-- TOC entry 221 (class 1259 OID 24826)
-- Name: Transactions; Type: TABLE; Schema: PaperTrading; Owner: -
--

CREATE TABLE "PaperTrading"."Transactions" (
    transaction_id integer NOT NULL,
    user_id integer NOT NULL,
    ticker character varying(10),
    price numeric(10,2) DEFAULT 0,
    type character varying(4),
    executed_at timestamp without time zone
);


--
-- TOC entry 219 (class 1259 OID 24824)
-- Name: Portfolio_transaction_id_seq; Type: SEQUENCE; Schema: PaperTrading; Owner: -
--

ALTER TABLE "PaperTrading"."Transactions" ALTER COLUMN transaction_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "PaperTrading"."Portfolio_transaction_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 24825)
-- Name: Portfolio_user_id_seq; Type: SEQUENCE; Schema: PaperTrading; Owner: -
--

CREATE SEQUENCE "PaperTrading"."Portfolio_user_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4826 (class 0 OID 0)
-- Dependencies: 220
-- Name: Portfolio_user_id_seq; Type: SEQUENCE OWNED BY; Schema: PaperTrading; Owner: -
--

ALTER SEQUENCE "PaperTrading"."Portfolio_user_id_seq" OWNED BY "PaperTrading"."Transactions".user_id;


--
-- TOC entry 224 (class 1259 OID 24840)
-- Name: Positions; Type: TABLE; Schema: PaperTrading; Owner: -
--

CREATE TABLE "PaperTrading"."Positions" (
    position_id bigint NOT NULL,
    user_id integer NOT NULL,
    ticker character varying(10),
    quantity numeric(10,3),
    average_price numeric(10,2)
);


--
-- TOC entry 222 (class 1259 OID 24838)
-- Name: Positions_position_id_seq; Type: SEQUENCE; Schema: PaperTrading; Owner: -
--

CREATE SEQUENCE "PaperTrading"."Positions_position_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4827 (class 0 OID 0)
-- Dependencies: 222
-- Name: Positions_position_id_seq; Type: SEQUENCE OWNED BY; Schema: PaperTrading; Owner: -
--

ALTER SEQUENCE "PaperTrading"."Positions_position_id_seq" OWNED BY "PaperTrading"."Positions".position_id;


--
-- TOC entry 223 (class 1259 OID 24839)
-- Name: Positions_user_id_seq; Type: SEQUENCE; Schema: PaperTrading; Owner: -
--

CREATE SEQUENCE "PaperTrading"."Positions_user_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4828 (class 0 OID 0)
-- Dependencies: 223
-- Name: Positions_user_id_seq; Type: SEQUENCE OWNED BY; Schema: PaperTrading; Owner: -
--

ALTER SEQUENCE "PaperTrading"."Positions_user_id_seq" OWNED BY "PaperTrading"."Positions".user_id;


--
-- TOC entry 218 (class 1259 OID 24818)
-- Name: Users; Type: TABLE; Schema: PaperTrading; Owner: -
--

CREATE TABLE "PaperTrading"."Users" (
    user_id integer NOT NULL,
    username character varying(20) NOT NULL,
    password_hash character varying(60) NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 24817)
-- Name: Users_user_id_seq; Type: SEQUENCE; Schema: PaperTrading; Owner: -
--

CREATE SEQUENCE "PaperTrading"."Users_user_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4829 (class 0 OID 0)
-- Dependencies: 217
-- Name: Users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: PaperTrading; Owner: -
--

ALTER SEQUENCE "PaperTrading"."Users_user_id_seq" OWNED BY "PaperTrading"."Users".user_id;


--
-- TOC entry 4665 (class 2604 OID 24843)
-- Name: Positions position_id; Type: DEFAULT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Positions" ALTER COLUMN position_id SET DEFAULT nextval('"PaperTrading"."Positions_position_id_seq"'::regclass);


--
-- TOC entry 4666 (class 2604 OID 24844)
-- Name: Positions user_id; Type: DEFAULT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Positions" ALTER COLUMN user_id SET DEFAULT nextval('"PaperTrading"."Positions_user_id_seq"'::regclass);


--
-- TOC entry 4663 (class 2604 OID 24829)
-- Name: Transactions user_id; Type: DEFAULT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Transactions" ALTER COLUMN user_id SET DEFAULT nextval('"PaperTrading"."Portfolio_user_id_seq"'::regclass);


--
-- TOC entry 4662 (class 2604 OID 24821)
-- Name: Users user_id; Type: DEFAULT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Users" ALTER COLUMN user_id SET DEFAULT nextval('"PaperTrading"."Users_user_id_seq"'::regclass);


--
-- TOC entry 4675 (class 2606 OID 24860)
-- Name: OptionsData OptionsData_pkey; Type: CONSTRAINT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."OptionsData"
    ADD CONSTRAINT "OptionsData_pkey" PRIMARY KEY ("contractSymbol");


--
-- TOC entry 4671 (class 2606 OID 24831)
-- Name: Transactions Portfolio_pkey; Type: CONSTRAINT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Transactions"
    ADD CONSTRAINT "Portfolio_pkey" PRIMARY KEY (transaction_id);


--
-- TOC entry 4673 (class 2606 OID 24851)
-- Name: Positions Positions_pkey; Type: CONSTRAINT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Positions"
    ADD CONSTRAINT "Positions_pkey" PRIMARY KEY (position_id);


--
-- TOC entry 4669 (class 2606 OID 24823)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (user_id);


--
-- TOC entry 4676 (class 2606 OID 24832)
-- Name: Transactions Portfolio_user_id_fkey; Type: FK CONSTRAINT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Transactions"
    ADD CONSTRAINT "Portfolio_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "PaperTrading"."Users"(user_id) ON DELETE RESTRICT;


--
-- TOC entry 4677 (class 2606 OID 24845)
-- Name: Positions positions_user_id_fkey; Type: FK CONSTRAINT; Schema: PaperTrading; Owner: -
--

ALTER TABLE ONLY "PaperTrading"."Positions"
    ADD CONSTRAINT positions_user_id_fkey FOREIGN KEY (user_id) REFERENCES "PaperTrading"."Users"(user_id) ON DELETE RESTRICT;


-- Completed on 2025-05-14 23:30:43

--
-- PostgreSQL database dump complete
--

