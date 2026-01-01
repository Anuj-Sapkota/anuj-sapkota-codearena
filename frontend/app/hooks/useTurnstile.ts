"use client"

import { useEffect, useRef,  useState } from "react"

export const useTurnstile = (sitekey: string) => 
{
    const ref = useRef<HTMLDivElement>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(()=>{
      if(!ref.current) return;

      const  interval = setInterval(()=> {
        if(window.turnstile)
      })
    })
}