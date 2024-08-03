"use client"

import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JSONTreeView from './JSONTreeView';
import { WikipediaAPI } from '@/lib/WikipediaService';
import { openInNewTab } from '@/lib/utils';

const apiCategories = {
  'Page Content': ['GET_page', 'GET_page_title', 'GET_page_title_revision', 'GET_page_html', 'GET_page_html_revision', 'GET_page_data_parsoid', 'GET_page_lint', 'GET_page_segments', 'GET_page_summary', 'GET_page_media_list', 'GET_page_related', 'GET_page_random', 'GET_page_pdf'],
  'Mobile': ['GET_page_mobile_html', 'GET_page_mobile_html_offline_resources', 'GET_page_mobile_sections', 'GET_page_mobile_sections_lead', 'GET_page_mobile_sections_remaining'],
  'Data': ['GET_data_css_mobile', 'GET_data_javascript_mobile', 'GET_data_i18n'],
};

const APITestScreen: React.FC = () => {
  const [apiMethod, setApiMethod] = useState(Object.keys(WikipediaAPI)[0]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<any>('');
  const [activeTab, setActiveTab] = useState('json');
  const [htmlResult, setHtmlResult] = useState('');

  useEffect(() => {
    // Reset input values when API method changes
    setInputValues({});
    setResult('');
    setHtmlResult('');
    // Set default tab based on response type
    setActiveTab(WikipediaAPI[apiMethod].responseType === 'html' ? 'html' : 'json');
  }, [apiMethod]);

  const handleInputChange = (name: string, value: string) => {
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const handleApiCall = async () => {
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
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-row mb-4 justify-between">
        <h1 className="text-2xl font-bold my-auto">위키피디아 API 테스트</h1>
        <Button onClick={() => openInNewTab('https://en.wikipedia.org/api/rest_v1/')}>REST API Document</Button>
      </div>
      <div className="mb-2">
        <Select onValueChange={(value: string) => setApiMethod(value)} value={apiMethod}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="API 메소드 선택" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(apiCategories).map(([category, methods]) => (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {methods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col mb-8 ml-2">
        <p className="">{WikipediaAPI[apiMethod].url}</p>
        <p className="">{WikipediaAPI[apiMethod].description}</p>
      </div>
      {WikipediaAPI[apiMethod].inputs.map((input, index) => (
        <div key={index} className="mb-4">
          <label className="block mb-2">{`{${input.name}}: ${input.description}`}</label>
          <Input
            type="text"
            value={inputValues[input.name] || ''}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
            placeholder={input.name}
          />
        </div>
      ))}
      <Button onClick={handleApiCall} className="mb-8">API 호출</Button>
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="json" className="w-full">
        <TabsList>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="tree">트리 뷰</TabsTrigger>
          <TabsTrigger value="html" disabled={WikipediaAPI[apiMethod].responseType !== 'html'}>HTML</TabsTrigger>
        </TabsList>
        <TabsContent value="json">
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </TabsContent>
        <TabsContent value="tree">
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
            {typeof result === 'object' && result !== null ? (
              <JSONTreeView data={result} />
            ) : (
              <p>JSON 데이터를 파싱할 수 없습니다.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="html">
          <iframe srcDoc={htmlResult} className="w-full h-[500px] border rounded" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APITestScreen;