"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react"

const isValidAmazonProductURL = (url: string): boolean => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname.toLowerCase();
        return hostname.includes('amazon.com') || hostname.includes('amazon.');
    } catch {
        return false;
    }
}

const Searchbar = () => {
    const router = useRouter();
    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        const isValidUrl = isValidAmazonProductURL(searchPrompt);

        if (!isValidUrl) {
            setError('Please provide a valid Amazon product link');
            return;
        }

        try {
            setIsLoading(true);
            const productId = await scrapeAndStoreProduct(searchPrompt);
            if (productId) {
                router.push(`/products/${productId}`);
            }
        } catch (error) {
            console.error('Error scraping product:', error);
            setError('Failed to scrape product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <>
            <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
                <input 
                    type="text"
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    placeholder="Enter Amazon Product Link" 
                    className="searchbar-input"
                    disabled={isLoading}
                />
                <button
                    type="submit" 
                    className="searchbar-btn"
                    disabled={searchPrompt === '' || isLoading}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
    )
}

export default Searchbar
