"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings } from "lucide-react"

export function Component() {
  const [userInput, setUserInput] = useState("")
  const [predictedWords, setPredictedWords] = useState<string[]>([])
  const [translatedText, setTranslatedText] = useState("")
  const [selectedModel, setSelectedModel] = useState("llama3-groq-70b-8192-tool-use-preview")
  const [isLoading, setIsLoading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'translate' | 'complete'>('translate')
  const [detectedLanguage, setDetectedLanguage] = useState<string>("")
  const [apiKey, setApiKey] = useState("")
  const [isApiKeyValid, setIsApiKeyValid] = useState(false)

  const debouncedPredictWords = useDebounce(async (text: string) => {
    if (text.trim() !== "" && activeTab === 'complete') {
      setIsLoading(true)
      try {
        const words = await predictNextWords(text, selectedModel)
        setPredictedWords(words.filter((word: string) => word.trim() !== ""))
        setCurrentWordIndex(0)
        const detectedLang = await detectLanguage(text)
        setDetectedLanguage(detectedLang)
      } catch (error) {
        console.error('Error:', error)
        setPredictedWords([])
        setError("Prediction failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }, 500)

  const debouncedTranslateText = useDebounce(async (text: string) => {
    if (text.trim() !== "" && activeTab === 'translate') {
      setIsLoading(true)
      try {
        const translation = await translateText(text, selectedModel)
        setTranslatedText(translation)
      } catch (error) {
        console.error('Error:', error)
        setTranslatedText("")
        setError("Translation failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }, 500)

  const handleUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value
    setUserInput(inputText)
    setError(null)

    if (activeTab === 'complete') {
      debouncedPredictWords(inputText)
    } else if (activeTab === 'translate') {
      debouncedTranslateText(inputText)
    }
  }

  const handleReset = () => {
    setUserInput("")
    setPredictedWords([])
    setTranslatedText("")
    setCurrentWordIndex(0)
    setError(null)
    setDetectedLanguage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (predictedWords.length > 0) {
        setUserInput(prevInput => {
          const lines = prevInput.split('\n');
          lines[lines.length - 1] += " " + predictedWords[currentWordIndex];
          return lines.join('\n');
        })
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % predictedWords.length)
      }
    }
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value)
  }

  const handleRetry = async () => {
    setError(null)
    setIsLoading(true)
    try {
      if (activeTab === 'translate') {
        const translation = await translateText(userInput, selectedModel)
        setTranslatedText(translation)
      } else {
        const words = await predictNextWords(userInput, selectedModel)
        setPredictedWords(words)
        setCurrentWordIndex(0)
        const detectedLang = await detectLanguage(userInput)
        setDetectedLanguage(detectedLang)
      }
    } catch (error) {
      console.error('Error:', error)
      setPredictedWords([])
      setTranslatedText("")
      setError(activeTab === 'translate' ? "Translation failed. Please try again." : "Prediction failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePredictedWordClick = (word: string) => {
    setUserInput(prevInput => {
      const lines = prevInput.split('\n');
      lines[lines.length - 1] += " " + word;
      return lines.join('\n');
    })
    debouncedPredictWords(userInput + " " + word)
  }

  async function predictNextWords(text: string, model: string) {
    try {
      const lines = text.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {"role": "system", "content": "You are an AI assistant that predicts the next words based on context. Provide 5 possible next words or short phrases, each on a new line. Do not include numbers, explanations, or any other text."},
            {"role": "user", "content": `Given the following text, predict 5 possible next words or short phrases that could naturally follow. Respond in the same language as the input. Text: ${lastLine}`}
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.choices[0].message.content.trim().split('\n')
    } catch (error) {
      console.error('Error predicting words:', error)
      throw error
    }
  }

  async function translateText(text: string, model: string) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {"role": "system", "content": "You are a professional translator. Translate the given text to English accurately and fluently."},
            {"role": "user", "content": `Translate this text to English: ${text}`}
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error translating text:', error)
      throw error
    }
  }

  async function detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {"role": "system", "content": "You are a language detection expert. Detect the language of the given text and respond with only the language name."},
            {"role": "user", "content": `Detect the language of this text: ${text}`}
          ],
          max_tokens: 10,
          temperature: 0.3
        })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error detecting language:', error)
      return "Unknown"
    }
  }

  function useDebounce(callback: (...args: any[]) => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]);
  }

  const validateApiKey = async (key: string) => {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          "Authorization": `Bearer ${key}`,
        },
      });
      setIsApiKeyValid(response.ok);
      if (response.ok) {
        setApiKey(key);
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      setIsApiKeyValid(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-2xl w-full p-8 rounded-xl shadow-xl bg-card">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-card-foreground mb-4 sm:mb-0">AI Assistant</h1>
          <div className="flex items-center">
            <select 
              className="bg-card-foreground text-card p-2 rounded-lg border border-muted focus:border-primary focus:ring-primary w-full sm:w-auto mr-2"
              value={selectedModel}
              onChange={handleModelChange}
            >
              <option value="gemma2-9b-it">gemma2-9b-it</option>
              <option value="gemma-7b-it">gemma-7b-it</option>
              <option value="llama3-groq-70b-8192-tool-use-preview">llama3-groq-70b-8192-tool-use-preview</option>
              <option value="llama3-groq-8b-8192-tool-use-preview">llama3-groq-8b-8192-tool-use-preview</option>
              <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
            </select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>API Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    id="apiKey"
                    placeholder="Enter your GROQ API key"
                    className="col-span-3"
                    onChange={(e) => validateApiKey(e.target.value)}
                  />
                  {isApiKeyValid ? (
                    <span className="text-green-500">✓ API key is valid</span>
                  ) : (
                    <span className="text-red-500">✗ Invalid API key</span>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex mb-4">
          <Button
            variant={activeTab === 'translate' ? 'default' : 'outline'}
            onClick={() => setActiveTab('translate')}
            className="mr-2"
          >
            Translate
          </Button>
          <Button
            variant={activeTab === 'complete' ? 'default' : 'outline'}
            onClick={() => setActiveTab('complete')}
          >
            Complete
          </Button>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          {activeTab === 'translate' 
            ? "Enter the text you want to translate." 
            : "Type in the text area and the application will predict the next possible words using the selected model. Press the Tab key to add the predicted words."}
        </p>
        <div className="flex flex-col gap-6">
          <Textarea
            value={userInput}
            onChange={handleUserInput}
            onKeyDown={handleKeyDown}
            placeholder={activeTab === 'translate' ? "Text to translate..." : "Type here..."}
            className="bg-card-foreground text-card p-4 rounded-lg border border-muted focus:border-primary focus:ring-primary min-h-[150px]"
          />
          <div className="flex items-center justify-between">
            <div className="text-xl font-medium text-card-foreground">
              {activeTab === 'translate' ? "Translation:" : "Predicted words:"}
            </div>
            {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
          </div>
          {error && (
            <div className="flex items-center justify-between">
              <div className="text-red-500">{error}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="text-blue-500 hover:bg-blue-100"
              >
                Retry
              </Button>
            </div>
          )}
          {activeTab === 'translate' ? (
            <div className="bg-card-foreground text-card p-4 rounded-lg border border-muted min-h-[100px]">
              {translatedText}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                {predictedWords.map((word, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className="px-4 py-2 text-base bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                    onClick={() => handlePredictedWordClick(word)}
                  >
                    {word}
                  </Button>
                ))}
              </div>
              {detectedLanguage && (
                <div className="text-sm text-muted-foreground">
                  Detected Language: {detectedLanguage}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <Button 
            variant="ghost" 
            size="lg" 
            className="text-muted-foreground hover:bg-muted/20 px-6"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}