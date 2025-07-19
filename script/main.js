const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Chess } = require('chess.js');

// eco_data.csv의 pgn 데이터에서 fen을 만들어냄(with chess.js)
// eco,name,urlName,pgn,fen,mdx 이런 scheme을 가짐.
// 여기서 pgn을 fen으로 변환하는 작업을 수행합니다.
// 그리고 그 fen을 기존의 데이터와 함꼐 new_eco_data.csv에 저장합니다.

async function convertPgnToFen() {
    const results = [];
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('./eco_data.csv')
            .pipe(csv())
            .on('data', (data) => {
                try {
                    const chess = new Chess();
                    
                    // PGN 데이터가 있는 경우 로드
                    if (data.pgn && data.pgn.trim()) {
                        chess.loadPgn(data.pgn);
                    }
                    
                    // 현재 보드 상태의 FEN 생성
                    const fen = chess.fen();
                    
                    // 기존 데이터에 FEN 추가
                    results.push({
                        eco: data.eco,
                        name: data.name,
                        urlName: data.urlName,
                        pgn: data.pgn,
                        fen: fen,
                        mdx: data.mdx
                    });
                } catch (error) {
                    console.error(`Error processing row: ${error.message}`, data);
                    // 에러가 발생한 경우 빈 FEN으로 처리
                    results.push({
                        eco: data.eco,
                        name: data.name,
                        urlName: data.urlName,
                        pgn: data.pgn,
                        fen: '',
                        mdx: data.mdx
                    });
                }
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function saveToNewCsv(data) {
    const csvWriter = createCsvWriter({
        path: '../data/new_eco_data.csv',
        header: [
            { id: 'eco', title: 'eco' },
            { id: 'name', title: 'name' },
            { id: 'urlName', title: 'urlName' },
            { id: 'pgn', title: 'pgn' },
            { id: 'fen', title: 'fen' },
            { id: 'mdx', title: 'mdx' }
        ]
    });

    await csvWriter.writeRecords(data);
    console.log('new_eco_data.csv 파일이 성공적으로 생성되었습니다.');
}

async function main() {
    try {
        console.log('PGN을 FEN으로 변환 중...');
        const processedData = await convertPgnToFen();
        
        console.log(`총 ${processedData.length}개의 레코드를 처리했습니다.`);
        
        await saveToNewCsv(processedData);
        console.log('변환 완료!');
        
    } catch (error) {
        console.error('오류 발생:', error);
    }
}

// 스크립트 실행
main();