"use client"

import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import JSONTreeView from './JSONTreeView';
import { WikipediaAPI, apiCategories, importantAPIs } from '@/service/WikipediaService';
import { openInNewTab } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2, Send, Star } from 'lucide-react';

const WikiAPITestScreen: React.FC = () => {
  const router = useRouter();

  const [apiMethod, setApiMethod] = useState(Object.keys(WikipediaAPI)[0]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<any>('');
  const [activeTab, setActiveTab] = useState('json');
  const [htmlResult, setHtmlResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInputValues({});
    setResult('');
    setHtmlResult('');
    setActiveTab(WikipediaAPI[apiMethod].responseType === 'html' ? 'html' : 'json');
  }, [apiMethod]);

  const handleInputChange = (name: string, value: string) => {
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const handleApiCall = async () => {
    setIsLoading(true);
    try {
      const api = WikipediaAPI[apiMethod];
      const args = api.inputs.map(input => inputValues[input.name]);
      const response = await api.method(...args);

      if (api.responseType === 'html') {
        setResult(response.data);
        setHtmlResult(response.data);
        setActiveTab('html');
      } else if (api.responseType === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'wikipedia.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        setResult('PDF 다운로드가 시작되었습니다.');
        setActiveTab('json');
      } else {
        setResult(response.data);
        setHtmlResult('');
        setActiveTab('json');
      }
    } catch (error) {
      if (error instanceof Error) {
        setResult(`오류: ${error.message}`);
      } else {
        setResult('알 수 없는 오류가 발생했습니다');
      }
      setActiveTab('json');
      setHtmlResult('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-4 sticky top-0 bg-white z-10 pb-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="text-2xl sm:text-3xl font-bold">위키피디아 API</CardTitle>
            </div>
            <CardDescription className="mt-2">
              위키피디아 API를 테스트하고 결과를 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h2 className="text-xl font-semibold mb-4">API 설정</h2>
              <Select onValueChange={(value: string) => setApiMethod(value)} value={apiMethod}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="API 메소드 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(apiCategories).map(([category, methods]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-gray-900 bg-gray-100 border-b border-gray-200">
                        {category}
                      </SelectLabel>
                      {methods.map((method) => (
                        <SelectItem key={method} value={method} className="flex items-center">
                          <div className='flex flex-row items-center'>
                            {method}
                            {importantAPIs.includes(method) && (
                              <Star className="ml-2 h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <p className="text-sm font-medium text-gray-500 mb-2">API URL:</p>
                <p className="text-sm break-all">{WikipediaAPI[apiMethod].url}</p>
                <Separator className="my-2" />
                <p className="text-sm font-medium text-gray-500 mb-2">설명:</p>
                <p className="text-sm">{WikipediaAPI[apiMethod].description}</p>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto p-2">
                {WikipediaAPI[apiMethod].inputs.map((input, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{`${input.name}: ${input.description}`}</label>
                    <Input
                      type="text"
                      value={inputValues[input.name] || ''}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      placeholder={input.name}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleApiCall} className="w-full mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로딩 중
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> API 호출
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API 응답</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="json" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="tree">트리 뷰</TabsTrigger>
              <TabsTrigger value="html" disabled={WikipediaAPI[apiMethod].responseType !== 'html'}>HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="json">
              <ScrollArea className="h-[300px] sm:h-[500px] w-full rounded-md border">
                <pre className="p-4 text-sm">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="tree">
              <ScrollArea className="h-[300px] sm:h-[500px] w-full rounded-md border">
                <div className="p-4">
                  {typeof result === 'object' && result !== null ? (
                    <JSONTreeView data={result} />
                  ) : (
                    <p>JSON 데이터를 파싱할 수 없습니다.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="html">
              <div className="h-[300px] sm:h-[500px] w-full rounded-md border">
                <iframe srcDoc={htmlResult} className="w-full h-full" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center w-full mt-4 space-x-4">
        <Button className="w-[49%]" variant="outline" onClick={handleBackToHome}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 메인
        </Button>
        <Button className="w-[49%]" onClick={() => openInNewTab('https://en.wikipedia.org/api/rest_v1/')}>
          REST API 문서 <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WikiAPITestScreen;