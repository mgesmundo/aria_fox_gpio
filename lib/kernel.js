/**
 * This is the kernel map for all Acmesystems Aria/Fox connectors
 * 
 * @author Marcello Gesmundo
 * 
 * # License
 * 
 * Copyright (c) 2012-2013 Yoovant by Marcello Gesmundo. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * 
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following
 *      disclaimer in the documentation and/or other materials provided
 *      with the distribution.
 *    * Neither the name of Yoovant nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *      
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
module.exports = function(model) {
    if (model !== 'aria' && model !== 'fox') {
        throw new Error('Only aria or fox model allowed.');
    }
    
    var kernel = {
        serials: {
            D1: '/dev/ttyS2',
            D2: '/dev/ttyS5',
            D3: '/dev/ttyS1',
            D5: '/dev/ttyS6',
            D6: '/dev/ttyS4',
            D8: '/dev/ttyS3'
        },
        connectors: {
            J6: {
                '3'  :  92,
                '4'  :  71,
                '5'  :  70,
                '6'  :  93,
                '7'  :  90,
                '8'  :  69,
                '9'  :  68,
                '10' :  91,
                '13' :  75,
                '14' :  74,
                '15' :  77,
                '16' :  76,
                '17' :  85,
                '18' :  84,
                '19' :  95,
                '20' :  94,
                '21' :  63,
                '22' :  62,
                '24' :  38,
                '25' :  39,
                '26' :  41,
                '27' :  99,
                '28' :  98,
                '29' :  97,
                '30' :  96,
                '31' :  56,
                '32' :  55,
                '36' :  42,
                '37' :  54,
                '38' :  43
            },
            J7: {
                '3'  :  82,
                '4'  :  83,
                '5'  :  80,
                '6'  :  81,
                '7'  :  66,
                '8'  :  67,
                '9'  :  64,
                '10' :  65,
                '11' : 110,
                '12' : 111,
                '13' : 108,
                '14' : 109,
                '15' : 105,
                '16' : 106,
                '17' : 103,
                '18' : 104,
                '19' : 101,
                '20' : 102,
                '21' :  73,
                '22' :  72,
                '31' :  87,
                '32' :  86,
                '33' :  89,
                '34' :  88,
                '35' :  60,
                '36' :  59,
                '37' :  58,
                '38' :  57
            },
            D1: {
                '1' :   0,
                '2' :  70,
                '3' :  71,
                '4' :  92,
                '5' :  93,
                '6' :   0,
                '7' :  55,
                '8' :  56,
                '9' :   0,
                '10':   0
            },
            D2: {
                '1' :   0,
                '2' :  63,
                '3' :  62,
                '4' :  61,
                '5' :  60,
                '6' :  59,
                '7' :  58,
                '8' :  57,
                '9' :  94,
                '10':   0
            },
            D3: {
                '1' :   0,
                '2' :  68,
                '3' :  69,
                '4' :  90,
                '5' :  91,
                '6' :  86,
                '7' :  88,
                '8' :  89,
                '9' :  87,
                '10':   0
            },
            D4: {
                '1' :   0,
                '2' :   0,
                '3' :   0,
                '4' :   0,
                '5' :  96,
                '6' :  97,
                '7' :  98,
                '8' :  99,
                '9' :   0,
                '10':   0
            },
            D5: {
                '1' :   0,
                '2' :  76,
                '3' :  77,
                '4' :  80,
                '5' :  81,
                '6' :  82,
                '7' :  83,
                '8' :  84,
                '9' :  85,
                '10':   0
            },
            D6: {
                '1' :   0,
                '2' :  74,
                '3' :  75,
                '4' : 104,
                '5' : 106,
                '6' :  95,
                '7' :  55,
                '8' :  56,
                '9' :   0,
                '10':   0
            },
            D7: {
                '1' :   0, 
                '2' :  65,
                '3' :  64,
                '4' :  66,
                '5' :  67,
                '6' : 101,
                '7' : 100,
                '8' :  99,
                '9' :   0,
                '10':   0
            },
            D8: {
                '1' :   0,
                '2' :  72,
                '3' :  73,
                '4' :   0,
                '5' :   0,
                '6' :   0,
                '7' :  55,
                '8' :  56,
                '9' :   0,
                '10':   0
            }
        }             
    };
    
    if (model === 'aria') {
        kernel.connectors.N = {
            '2' :  96,
            '3' :  97,
            '4' :  98,
            '5' :  99,
            '6' : 100,
            '7' : 101,
            '8' : 102,
            '9' : 103,
            '10': 104,
            '11': 105,
            '12': 106,
            '13': 107,
            '14': 108,
            '15': 109,
            '16': 110,
            '17': 111,
            '18': 112,
            '19': 113,
            '20': 114,
            '21': 115,
            '22': 116,
            '23': 117
        };
        kernel.connectors.E = {
            '2' : 118,
            '3' : 119,
            '4' : 120,
            '5' : 121,
            '6' : 122,
            '7' : 123,
            '8' : 124,
            '9' : 125,
            '10': 126,
            '11': 127
        };
        kernel.connectors.S = {
            '2' : 53,
            '3' : 52,
            '4' : 51,
            '5' : 50,
            '6' : 49,
            '7' : 48,
            '8' : 47,
            '9' : 46,
            '10': 45,
            '11': 44,
            '12': 43,
            '13': 42,
            '14': 41,
            '15': 40,
            '16': 39,
            '17': 38,
            '18': 37,
            '19': 36,
            '20': 35,
            '21': 34,
            '22': 33,
            '23': 32
        };
        kernel.connectors.W = {
            '9' : 54,
            '10': 55,
            '11': 56,
            '12': 57,
            '13': 58,
            '14': 59,
            '15': 60,
            '16': 61,
            '17': 62,
            '18': 63,
            '20': 75,
            '21': 76,
            '22': 77,
            '23': 78
        };   
        kernel.connectors.D10 = {
            '1' :   0,
            '2' : 118,
            '3' : 119,
            '4' : 120,
            '5' : 121,
            '6' : 122,
            '7' :  62,
            '8' :  63,
            '9' :   0,
            '10':   0
        };
        kernel.connectors.D11 = {
            '1' :   0,
            '2' : 112,
            '3' : 113,
            '4' : 114,
            '5' : 115,
            '6' : 116,
            '7' : 117,
            '8' :  98,
            '9' :  99,
            '10':   0
        };
        kernel.connectors.D12 = {
            '1' :   0,
            '2' : 104,
            '3' : 105,
            '4' : 106,
            '5' : 107,
            '6' : 108,
            '7' : 109,
            '8' : 110,
            '9' : 111,
            '10':   0
        };
        kernel.connectors.D13 = {
            '1' :   0,
            '2' :  37,
            '3' :  38,
            '4' : 123,
            '5' : 124,
            '6' : 125,
            '7' :  96,
            '8' :  97,
            '9' :   0,
            '10':   0
        };
        kernel.connectors.D14 = {
            '1' :   0,
            '2' :   0,
            '3' :   0,
            '4' :   0,
            '5' :  75,
            '6' :  76,
            '7' :  77,
            '8' :  78,
            '9' :   0,
            '10':   0
        };
        kernel.connectors.D15 = {
            '1' :   0,
            '2' :  44,
            '3' :  43,
            '4' :  45,
            '5' :  46,
            '6' :  39,
            '7' :  33,
            '8' :   0,
            '9' :   0,
            '10':   0,
        };
        kernel.connectors.D16 = {
            '1' :   0,
            '2' :  61,
            '3' :  59,
            '4' :  56,
            '5' :  57,
            '6' :  58,
            '7' :  62,
            '8' :  63,
            '9' :  60,
            '10':   0
        };
    }
    
    return kernel;
};