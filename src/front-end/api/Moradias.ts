import { useEffect, useState } from "react";
import Moradia from "../types/Moradia";

export default function FetchMoradias() {
  const [moradias, setMoradias] = useState<Moradia[]>([]);

  useEffect(() => {
    const fetchMoradias = async () => {
      try {
        const response = await fetch("http://192.168.0.22:3000/moradias/"); 
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMoradias(data);
      } catch (error) {
        console.error("Error fetching moradias:", error);
      }
    };

    fetchMoradias();
  }, []);

  return moradias;
}